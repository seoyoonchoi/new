-- ====================================
-- BookHub_DB SQL Script
-- ====================================

-- ====================================
-- 1. Database and Schema Setup
-- ====================================

CREATE DATABASE IF NOT EXISTS `bookhub_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
USE `bookhub_db`;


-- ===========================
-- 2. Branches and Employees
-- ===========================
CREATE TABLE IF NOT EXISTS `branches` (
    branch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL UNIQUE,
    branch_location VARCHAR(255) NOT NULL, # 주소
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# authorities 테이블
# : 권한(Authority)
# : 로그인 후 접근 권한, 기능 수행 제어 등 보안 목적
# : STAFF, ADMIN, MANAGER 등
CREATE TABLE IF NOT EXISTS `authorities` (
    authority_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    authority_name VARCHAR(255) NOT NULL UNIQUE # UNIQUE 제약 조건 추가(중복 권한명 방지)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# positions 테이블 추가
# : 직급(Position)
# : 조직 내에서 직원의 지위
# : EX) 사원, 대리, 과장, 부장, "점장" 등
CREATE TABLE IF NOT EXISTS `positions` (
    position_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(255) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `employees` (
    employee_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    position_id BIGINT NOT NULL DEFAULT 1, # 직급 추가
    authority_id BIGINT NOT NULL DEFAULT 1,
    employee_number INT NOT NULL UNIQUE, 
    login_id VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    birth_date DATE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_approved ENUM('PENDING', 'APPROVED', 'DENIED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status Enum('EMPLOYED', 'EXITED'),
    FOREIGN KEY (branch_id) REFERENCES branches (branch_id),
    FOREIGN KEY (authority_id) REFERENCES authorities (authority_id),
    FOREIGN KEY (position_id) REFERENCES positions (position_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# === 퇴사자 개인 정보 관리 (보존기간: 한국 기준 일반 권고)
# 인사기록, 계약서 (3 ~ 5년)
# 퇴직자 주민등록 번호 등 민감 정보 (최소화 후 3년 이내 파기 권고)
# 급여 관련 증빙자료 (5년)
# 로그 기록 (6개월 ~ 1년: 보안 목적)
# >>>>> 퇴사 관련 상세 정보는 employee_exit_logs에 기록

##### status 값에 따라 트리거 설정 #####

##### 직급-권한 확인 후 피드백 #####
# 권한을 직원과 다대다 구분을 사용할 것인지
# : 한 명의 직원이 여러 개의 권한 사용이 가능
# 본사 관리자, 지점 관리자, 직원


-- ====================================
-- 3. Employee Change Logs and Approval Logs
-- ====================================
CREATE TABLE IF NOT EXISTS `employee_signup_approvals` (
    approval_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    authorizer_id BIGINT,
    status VARCHAR(255) not null,
    applied_at DATETIME not null,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, # PENDING과 DENIED 시 NULL로 둘 것인지 (거절된 경우 거절한 권한자에 대한 메모와 시기 작성은?)
    -- PENDING 시 NULL로 두고, DENIED 시에는 시간을 기록하면 될 것 같습니다.
    denied_reason VARCHAR(255), -- 거절 이유
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (authorizer_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
   CONSTRAINT chk_status CHECK (status IN ('PENDING', 'APPROVED', 'DENIED'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `employee_change_logs` (
   log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
   employee_id BIGINT NOT NULL,
   authorizer_id BIGINT NOT NULL,
   change_type VARCHAR(25) NOT NULL,
   
   previous_authority_id BIGINT DEFAULT NULL, # 권한 변경
   previous_position_id BIGINT DEFAULT NULL, # 직급 변경
   previous_branch_id BIGINT DEFAULT NULL, # 지점 변경
   
   changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (employee_id)
      REFERENCES employees(employee_id),  
   FOREIGN KEY (authorizer_id)
      REFERENCES employees(employee_id),
    FOREIGN KEY (previous_authority_id)
      REFERENCES authorities(authority_id),
    FOREIGN KEY (previous_branch_id)
      REFERENCES branches(branch_id),
    CONSTRAINT chk_process_type
      CHECK (change_type IN ('POSITION_CHANGE', 'AUTHORITY_CHANGE', 'BRANCH_CHANGE'))
      # : 직급 변경 추가로 change_type 확장
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 퇴사 테이블
# : 퇴사 직원
CREATE TABLE IF NOT EXISTS `employee_exit_logs` (
    exit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    applied_at DATETIME not null,
    authorizer_id BIGINT NOT NULL,
    exit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_reason VARCHAR(25) NOT NULL,
    FOREIGN KEY (employee_id)
      REFERENCES employees(employee_id),
	FOREIGN KEY (authorizer_id)
      REFERENCES employees(employee_id),
    CONSTRAINT chk_exit_reason
      CHECK (exit_reason IN ('VOLUNTEER', 'FORCED', 'TERMINATED', 'RETIREMENT')) 
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ===============================
-- 4. Discount and Policy Management (할인 및 정책 관리)
-- ===============================
CREATE TABLE IF NOT EXISTS `policies`(
    policy_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_title VARCHAR(255) NOT NULL,
    policy_description TEXT DEFAULT NULL,
    policy_type VARCHAR(255) NOT NULL,
    
    total_price_achieve INT DEFAULT NULL,
    discount_percent INT NOT NULL,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL,
    
   CONSTRAINT chk_policy_type
      CHECK (policy_type IN ('BOOK_DISCOUNT','CATEGORY_DISCOUNT','TOTAL_PRICE_DISCOUNT'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ===============================
-- 5. Book Categories, Authors, Publishers
-- ===============================

# 카테고리 (계층 구조)
# : category_level (1차, 2차 등) 추가 고려
CREATE TABLE IF NOT EXISTS `book_categories` (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_category_id BIGINT DEFAULT NULL,
    category_name VARCHAR(255) NOT NULL,
    category_level INT NOT NULL DEFAULT 1, -- 1: 대분류, 2: 소분류
    category_type VARCHAR(255) NOT NULL,
    category_order INT DEFAULT 0, -- 카테고리 정렬 우선순위
    is_active BOOLEAN DEFAULT TRUE, -- 비활성 카테고리 제외 필터용 (삭제 대신 / 보존성 유지)
    policy_id BIGINT DEFAULT NULL,
    FOREIGN KEY (parent_category_id)
      REFERENCES book_categories (category_id) ON DELETE CASCADE,
   FOREIGN KEY (policy_id)
      REFERENCES policies (policy_id),
      CONSTRAINT chk_category_type
      CHECK (category_type IN ('DOMESTIC', 'FOREIGN'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `authors`(
    author_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL UNIQUE
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `publishers` (
    publisher_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    publisher_name VARCHAR(255) NOT NULL UNIQUE
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `books` (
    book_isbn VARCHAR(255) PRIMARY KEY,
    category_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    publisher_id BIGINT NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    book_price INT NOT NULL,
    published_date DATE NOT NULL,
    book_status VARCHAR(50) NOT NULL,
    cover_url VARCHAR(500),
    page_count VARCHAR(255) NOT NULL, # 책 페이지
    language VARCHAR(255) NOT NULL, # 책 원본 나라 표시
    description TEXT DEFAULT NULL,
    policy_id BIGINT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id)
      REFERENCES book_categories (category_id),
    FOREIGN KEY (author_id)
      REFERENCES authors(author_id),
    FOREIGN KEY (publisher_id)
      REFERENCES publishers(publisher_id),
    FOREIGN KEY (policy_id)
      REFERENCES policies (policy_id),
    CONSTRAINT chk_book_status
      CHECK (book_status IN ('ACTIVE','INACTIVE','HIDDEN'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `book_display_locations` (
    location_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    book_isbn VARCHAR(255) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    hall VARCHAR(50) NOT NULL,
    section VARCHAR(50) NOT NULL,
    display_type VARCHAR(50) NOT NULL,
    display_note TEXT NOT NULL, -- 위치에 대한 부연 설명
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    FOREIGN KEY (book_isbn) REFERENCES books(book_isbn),
    CONSTRAINT chk_display_type
      CHECK (display_type IN ('BOOK_SHELF','DISPLAY_TABLE'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ===============================
-- 6. Inventory Management (재고 관리)
-- ===============================
CREATE TABLE IF NOT EXISTS `stocks` (
    stock_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_isbn VARCHAR(255) NOT NULL,
    branch_id BIGINT NOT NULL,
    book_amount BIGINT DEFAULT 0,
    UNIQUE KEY uq_book_branch (book_isbn, branch_id),
    FOREIGN KEY (book_isbn) REFERENCES books(book_isbn),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_logs` (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL,
    employee_id BIGINT NOT NULL,
    book_isbn VARCHAR(255) NOT NULL,
    branch_id BIGINT NOT NULL,    
    amount BIGINT NOT NULL,
    book_amount BIGINT NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT DEFAULT NULL, -- 재고 이동 이유
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (book_isbn) REFERENCES books(book_isbn),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    CONSTRAINT chk_action_type
      CHECK (action_type IN ('IN', 'OUT', 'LOSS'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ===============================
-- 7. Order Management (발주 및 주문 관리)
-- ===============================
CREATE TABLE IF NOT EXISTS `purchase_orders` (
    purchase_order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    book_isbn VARCHAR(255) NOT NULL,
    purchase_employee_id BIGINT NOT NULL,
    purchase_order_amount INT NOT NULL,
    purchase_order_status VARCHAR(50) NOT NULL,
    purchase_order_date_at DATETIME NOT NULL,
    FOREIGN KEY (branch_id)
        REFERENCES branches (branch_id),
    FOREIGN KEY (book_isbn)
        REFERENCES books (book_isbn),
    FOREIGN KEY (purchase_employee_id)
        REFERENCES employees (employee_id),
    CONSTRAINT chk_purchase_order_status
      CHECK (purchase_order_status IN ('REQUESTED', 'APPROVED', 'REJECTED'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_order_approvals` (
    purchase_order_approval_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_approval_employee_id BIGINT NOT NULL,
    purchase_order_id BIGINT NOT NULL,
    is_approved BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (purchase_approval_employee_id)
        REFERENCES employees (employee_id),
    FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders (purchase_order_id)
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `book_reception_approvals` (
    book_reception_approval_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reception_employee_id BIGINT,
    book_isbn VARCHAR(255) NOT NULL,
    book_title VARCHAR(255) NOT NULL,
    purchase_order_amount INT NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    purchase_order_approval_id BIGINT NOT NULL,
    is_reception_approved BOOLEAN NOT NULL DEFAULT FALSE,
    reception_date_at DATETIME,
    FOREIGN KEY (reception_employee_id)
        REFERENCES employees (employee_id),
    FOREIGN KEY (purchase_order_approval_id)
        REFERENCES purchase_order_approvals (purchase_order_approval_id)
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer`(
    customer_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL UNIQUE,
    customer_phone_number VARCHAR(255) NOT NULL UNIQUE,
    customer_address VARCHAR(255) NOT NULL,
    customer_created_at DATETIME NOT NULL #가입일
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

#customer_orders_detail과 1:N으로 연결
CREATE TABLE IF NOT EXISTS `customer_orders` (
    customer_order_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    customer_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    customer_order_total_amount BIGINT NOT NULL,
    customer_order_total_price BIGINT NOT NULL, # cusc
    applied_policy_id BIGINT DEFAULT NULL,
    customer_order_date_at DATETIME NOT NULL,
    FOREIGN KEY (customer_id)
      REFERENCES customer (customer_id),
	FOREIGN KEY (applied_policy_id)
      REFERENCES policies (policy_id),
	FOREIGN KEY (branch_id)
      REFERENCES branches (branch_id)
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `customer_orders_detail` (
   customer_orders_detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
   customer_order_id BIGINT NOT NULL, 
   book_isbn VARCHAR(255) NOT NULL,
   amount BIGINT NOT NULL,
   price BIGINT NOT NULL,
   FOREIGN KEY (customer_order_id)
      REFERENCES customer_orders (customer_order_id),
   FOREIGN KEY (book_isbn)
     REFERENCES books(book_isbn)
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refund_orders` (
    refund_order_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    order_id BIGINT NOT NULL,
    refund_date_at DATETIME NOT NULL,
    refund_reason VARCHAR(255),
    FOREIGN KEY (order_id)
        REFERENCES customer_orders (customer_order_id) ON DELETE CASCADE,
    CONSTRAINT chk_refund_reason
      CHECK (refund_reason IN ('DEFECTIVE_PRODUCT', 'REPAYMENT_PLANNED', 'CHANGE_OF_MIND', 'OTHER'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ===============================
-- 8. Logs and Alerts (로그 및 알림 관리)
-- ===============================
CREATE TABLE IF NOT EXISTS `book_logs` (
    book_log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    policy_id BIGINT DEFAULT NULL,
    book_isbn VARCHAR(255) NOT NULL,
    log_type VARCHAR(25) NOT NULL,
    previous_price INT DEFAULT NULL,
    previous_discount_rate INT DEFAULT NULL,
    changed_at DATETIME NOT NULL,
    FOREIGN KEY (employee_id)
      REFERENCES employees (employee_id),
   FOREIGN KEY (book_isbn)
      REFERENCES books (book_isbn),
   FOREIGN KEY (policy_id)
      REFERENCES policies (policy_id),
    CONSTRAINT chk_log_type
      CHECK (log_type IN ('CREATE', 'PRICE_CHANGE', 'DISCOUNT_RATE', 'STATUS_CHANGE', 'HIDDEN'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
    alert_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL, -- 알림 수신자
    # <<alert_type>>    <tg_table> <tg_pk> <tg_isbn>  <msg>
    # 'SIGNUP_APPROVAL' | 'NONE' | 'NULL' | 'NULL' | message("신규 직원 가입 승인 요청이 도착하였습니다.")
    # 'STOCK_WARNING'   | 'BOOK' | 'NULL' | '4729' | message("책[책제목] 재고가 5권 이하 입니다.")
    # 'PURCHASE_REQUEST'| 'PURCHASE_ORDER' | 102 | 'NULL' | message("지점 A에서 [책제목] 발주 요청이 있습니다.")
    # 'DISCOUNT_POLICY' | 'DISCOUNT_POLICY' | 54 | 'NULL' | message("[책제목]에 대한 할인 정책이 새로 적용되었습니다.")
    alert_type VARCHAR(255),
    message TEXT NOT NULL, -- UI에 노출할 메시지
    target_table VARCHAR(255), -- 관련 테이블
    target_pk BIGINT DEFAULT NULL, -- 타겟 테이블의 기본키
    target_isbn VARCHAR(255) DEFAULT NULL, -- 타겟이 책일 경우 isbn 사용
    
    is_read BOOLEAN DEFAULT FALSE, -- 읽음 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT chk_alert_type
      CHECK (alert_type IN ('SIGNUP_APPROVAL', 'SIGNUP_APPROVAL_SUCCESS', 'CHANGE_PERMISSION_SUCCESS', 'CHANGE_BRANCH_SUCCESS',
      'CHANGE_POSITION_SUCCESS','STOCK_LOW', 'STOCK_OUT', 'PURCHASE_REQUESTED', 'PURCHASE_APPROVED', 'BOOK_RECEIVED_SUCCESS', 'NOTICE')),
      CONSTRAINT chk_target_table
      CHECK (target_table IN ('BOOK', 'EMPLOYEES', 'STOCKS','PURCHASE_ORDERS', 'PURCHASE_APPROVALS','BOOK_RECEPTION_APPROVALS', 'POLICIES'))
)CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# 메시지 내용만으로는 어떤 알림이 어떤 '책', '발주서', '정책'과 관련되어 있는지 불분명
# : target_table   알림이 연결된 대상 테이블 타입 (BOOK, PURCHASE_ORDER 등)
# : target_id   해당 대상의 기본 키 값 (book_isbn, purchase_order_id, policy_id 등과 매칭)

-- ===============================
-- 9. File System (파일 시스템 관리)
-- ===============================

CREATE TABLE IF NOT EXISTS `upload_files` (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    original_name VARCHAR(255) NOT NULL,  -- 원본 파일명
    file_name VARCHAR(255) NOT NULL,      -- 서버 저장 파일명
    file_path VARCHAR(500) NOT NULL,      -- 저장 경로
    file_type VARCHAR(100),               -- MIME 타입
    file_size BIGINT NOT NULL,            -- 크기 (bytes)

    target_id VARCHAR(255) NOT NULL,      -- 책 ISBN
    target_type VARCHAR(50) NOT NULL,     -- BOOK만 허용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_target_type CHECK (target_type = 'BOOK'),
    INDEX idx_target (target_type, target_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
