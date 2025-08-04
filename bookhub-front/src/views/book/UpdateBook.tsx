import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { updateBook, hideBook } from "@/apis/book/book";
import { BookUpdateRequestDto } from "@/dtos/book/request/Book.request.dto";
import { BookResponseDto } from "@/dtos/book/response/Book.response.dto";
import './UpdateBookModal.css'

interface UpdateBookProps {
  book: BookResponseDto;
  onSuccess: () => Promise<void>;
}

function UpdateBook({ book, onSuccess }: UpdateBookProps) {
  const [cookies] = useCookies(["accessToken"]);

  const [bookPrice, setBookPrice] = useState<number>(book.bookPrice);
  const [description, setDescription] = useState(book.description ?? "");
  const [policyId, setPolicyId] = useState<number | null>(book.policyId ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(book.categoryId ?? null);
  const [bookStatus, setBookStatus] = useState<'ACTIVE' | 'INACTIVE' | 'HIDDEN'>(book.bookStatus ?? 'ACTIVE');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = cookies.accessToken?.trim();
    if (!token) return;

    const dto: BookUpdateRequestDto = {
      isbn: book.isbn,
      bookPrice,
      description,
      bookStatus,
      ...(policyId !== null ? { policyId } : {}),
      categoryId,
    };

    try {
      const res = await updateBook(book.isbn, dto, token, coverFile);
      if (res.code !== "SU") throw new Error(res.message);
      alert("수정 성공");
      await onSuccess();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  const handleHide = async () => {
    const token = cookies.accessToken;
    if (!token) return;

    try {
      const res = await hideBook(book.isbn, token);
      if (res.code !== "SU") throw new Error(res.message);
      alert("삭제(HIDDEN) 처리됨");
      await onSuccess();
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  return (
    <div className="modal-container">
      <h2 className="modal-header">책 정보 수정</h2>
    <form onSubmit={handleUpdate} className="modal-form">

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="설명"
        className="modal-textarea"
        required
      />

      <input
        type="number"
        value={bookPrice}
        onChange={(e) => setBookPrice(Number(e.target.value))}
        placeholder="가격"
        className="modal-input"
        required
      />

      <input
        type="number"
        value={policyId ?? ""}
        onChange={(e) => setPolicyId(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="정책ID (선택)"
        className="modal-input"
      />

      <input
        type="number"
        value={categoryId ?? ""}
        onChange={(e) => setCategoryId(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="카테고리 ID"
        className="modal-input"
        required
      />

      <select
        value={bookStatus}
        onChange={(e) => setBookStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'HIDDEN')}
        className="modal-input"
      >
        <option value="ACTIVE">활성</option>
        <option value="INACTIVE">비활성</option>
        <option value="HIDDEN">숨김</option>
      </select>

      <div className="file-upload-wrapper">
          <label htmlFor="coverFile" className="file-upload-label">
            {coverFile ? coverFile.name : "책 표지 선택하기"}
          </label>
          <input
            id="coverFile"
            type="file"
            className="file-upload-input"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </div>

      <div className="modal-footer">
        <button type="submit" className="modal-button-confirm">확인</button>
      </div>
    </form>
    </div>
  );
}

export default UpdateBook;
