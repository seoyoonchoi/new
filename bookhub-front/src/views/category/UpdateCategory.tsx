import { updateCategory } from "@/apis/category/category";
import { CategoryUpdateRequestDto } from "@/dtos/category/request/Category.request.dto";
import { CategoryTreeResponseDto } from "@/dtos/category/response/Category.response.dto";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import "./UpdateCategoryModal.css";

interface UpdateCategoryProps {
  category: CategoryTreeResponseDto;
  onSuccess: () => void;
  mode: "update" | "delete";
}

function UpdateCategory({ category, onSuccess }: UpdateCategoryProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"DOMESTIC" | "FOREIGN">("DOMESTIC");
  const [discountPolicyId, setDiscountPolicyId] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [cookies] = useCookies(["accessToken"]);

  useEffect(() => {
    setCategoryName(category.categoryName);
    setCategoryType(category.categoryType);
    setIsActive(category.isActive);
    setDiscountPolicyId(category.discountPolicyId ?? null);
  }, [category]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = cookies.accessToken;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const dto: CategoryUpdateRequestDto = {
      categoryName,
      categoryType,
      isActive,
      categoryLevel: category.categoryLevel,
      ...(discountPolicyId !== null ? { discountPolicyId } : {}),
    };

    try {
      await updateCategory(category.categoryId, dto, token);
      alert("카테고리 수정 성공!");
      onSuccess();
    } catch (err) {
      alert("카테고리 수정 실패");
    }
  };

  return (
    <div className="modal-container">
    <form onSubmit={handleUpdate} className="modal-form">
      <h3>카테고리 수정</h3>

      <label className="modal-label">
      <input
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="카테고리 이름"
        required
        className="modal-input"
      />
      </label>

      <label className="modal-label">
      <select value={categoryType} className="modal-input" onChange={(e) => setCategoryType(e.target.value as "DOMESTIC" | "FOREIGN")}>
        <option value="DOMESTIC">국내도서</option>
        <option value="FOREIGN">해외도서</option>
      </select>
      </label>

      <label className="modal-label">
      <input
        type="number"
        value={discountPolicyId ?? ""}
        onChange={(e) => setDiscountPolicyId(Number(e.target.value))}
        placeholder="할인 정책 ID"
        className="modal-input"
      />
      </label>

      <label className="modal-checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        활성 상태
      </label>

      <button type="submit" className="modal-submit-btn">수정</button>
    </form>
    </div>
  );
}

export default UpdateCategory;