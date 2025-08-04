import React, { useEffect, useState } from "react";
import { searchBook, hideBook } from "@/apis/book/book";
import { BookResponseDto } from "@/dtos/book/response/Book.response.dto";
import { useCookies } from "react-cookie";
import UpdateBook from "./UpdateBook";
import CreateBook from "./CreateBook";
import Modal from "@/apis/constants/Modal";

function AdminBook() {
  const [cookies] = useCookies(["accessToken"]);
  const [keyword, setKeyword] = useState("");
  const [bookList, setBookList] = useState<BookResponseDto[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookResponseDto | null>(null);

  const handleSearch = async () => {
    const token = cookies.accessToken;
    if (!token) return;
    const res = await searchBook(keyword, token);
    if (res.code === "SU" && res.data) {
      setBookList(res.data);
    } else {
      alert("검색 실패: " + res.message);
    }
  };

  const handleHideBook = async (isbn: string) => {
    const token = cookies.accessToken;
    if (!token) return;
    if (!window.confirm("정말로 이 책을 숨기시겠습니까?")) return;
    const res = await hideBook(isbn, token);
    if (res.code === "SU") {
      alert("숨기기 성공");
      handleSearch();
    } else {
      alert("숨기기 실패: " + res.message);
    }
  };

  const handleSuccess = async () => {
    await handleSearch();
    setIsCreateModalOpen(false);
    setSelectedBook(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <h2>도서 검색</h2>
        <button
          className="createBtn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + 책 등록
        </button>
      </div>
      <div className="topBar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="책 제목, 저자, ISBN 등"
          className="search"
        />
        <button onClick={handleSearch} className="searchBtn">
          검색
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>제목</th>
            <th>저자</th>
            <th>출판사</th>
            <th>가격</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {bookList.map((book) => (
            <tr key={book.isbn}>
              <td>{book.bookTitle}</td>
              <td>{book.authorName}</td>
              <td>{book.publisherName}</td>
              <td>{book.bookPrice.toLocaleString()}원</td>
              <td>{book.bookStatus}</td>
              <td>
                <button
                  className="modifyBtn"
                  onClick={() => setSelectedBook(book)}
                >
                  수정
                </button>
                <button
                  className="deleteBtn"
                  onClick={() => handleHideBook(book.isbn)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
          {bookList.length === 0 && (
            <tr>
              <td>검색 결과가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {isCreateModalOpen && (
        <Modal isOpen={true} onClose={() => setIsCreateModalOpen(false)}>
          <CreateBook onSuccess={handleSuccess} />
        </Modal>
      )}

      {selectedBook && (
        <Modal isOpen={true} onClose={() => setSelectedBook(null)}>
          <UpdateBook book={selectedBook} onSuccess={handleSuccess} />
        </Modal>
      )}
    </div>
  );
}

export default AdminBook;
