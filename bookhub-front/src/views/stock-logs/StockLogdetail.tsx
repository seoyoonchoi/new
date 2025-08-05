import { StockLogResponseDto } from '@/dtos/stock/StockLog.response.dto';
import '@/styles/modal.css';

interface StockLogProps{
    isOpen: boolean;
    onClose : () => void;
    stockLogDetail : StockLogResponseDto;
}

function StockLogdetail({isOpen, onClose, stockLogDetail}:StockLogProps) {
  if(!isOpen) return null;

  return (
          <div className="modalOverlay">
              <div className="modalContainer">
                  <button className="modalCloseButton" onClick={onClose}>x</button>
                  <h2 className="modalTitle">정책 상세 조회</h2>
                  <table className="detailTable">
                    <tbody>
                        <tr>
                            <th>지점</th>
                            <td>{stockLogDetail.branchName}</td>
                        </tr>
                        <tr>
                            <th>직원</th>
                            <td>{stockLogDetail.employeeName}</td>
                        </tr>
                        <tr>
                            <th>책 제목</th>
                            <td>{stockLogDetail.bookTitle}</td>
                        </tr>
                           <tr>
                            <th>작업</th>
                            <td>{stockLogDetail.type}</td>
                        </tr>
                        <tr>
                            <th>수량</th>
                            <td>{stockLogDetail.amount}</td>
                        </tr>
                         <tr>
                            <th>누적재고량</th>
                            <td>{stockLogDetail.bookAmount}</td>
                        </tr>

                        <tr>
                            <th>날짜</th>
                            <td>{stockLogDetail.actionDate}</td>
                        </tr>

                        <tr>
                            <th>설명</th>
                            <td>{stockLogDetail.description}</td>
                        </tr>

                    </tbody>

                </table>

            </div>
        </div>
  );
};

export default StockLogdetail;
