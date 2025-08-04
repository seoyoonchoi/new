import { getCategoryTree } from '@/apis/category/category';
import { CategoryTreeResponseDto } from '@/dtos/category/response/Category.response.dto';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';


interface CategoryTreeProps {
  onSelect: (category: CategoryTreeResponseDto) => void;
  onEdit?: (category: CategoryTreeResponseDto) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ onSelect, onEdit }) => {
  const [cookies] = useCookies(["accessToken"]);

  const [categoriesMap, setCategoriesMap] = useState<{
    DOMESTIC?: CategoryTreeResponseDto[];
    FOREIGN?: CategoryTreeResponseDto[];
  }>({});

  const [expandedType, setExpandedType] = useState<"DOMESTIC" | "FOREIGN" | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<number[]>([]);

  const fetchCategories = async (type: "DOMESTIC" | "FOREIGN") => {
    if (!cookies.accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!categoriesMap[type]) {
      const res = await getCategoryTree(type, cookies.accessToken);
      if (res.code === "SU") {
        setCategoriesMap((prev) => ({ ...prev, [type]: res.data ?? [] }));
      } else {
        alert("카테고리 조회 실패");
        return;
      }
    }

    setExpandedType((prev) => (prev === type ? null : type));
    setExpandedCategoryIds([]);
  };

  const toggleCategory = (id: number) => {
    setExpandedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const renderCategoryTree = (categories?: CategoryTreeResponseDto[]) => {
    if (!categories) return null;

    return categories.map((cat) => {
      const isExpanded = expandedCategoryIds.includes(cat.categoryId);
      const hasChildren = cat.subCategories && cat.subCategories.length > 0;

      return (
        <div key={cat.categoryId} className="category">
          <div
            className={`category-parent ${hasChildren ? 'clickable' : ''}`}
            onClick={() => hasChildren && toggleCategory(cat.categoryId)}
          >
            <span className="category-arrow">
              {hasChildren ? (isExpanded ? "▼" : "▶") : "•"}
            </span>
            <span className="category-label" onClick={() => onEdit?.(cat)}>
              {cat.categoryName}
            </span>
          </div>

          {isExpanded && hasChildren && (
            <div className="subcategory-list">
              {cat.subCategories!.map((sub) => (
                <div
                  key={sub.categoryId}
                  className="subcategory-item"
                  onClick={() => onEdit?.(sub)}
                >
                  • {sub.categoryName}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="category-tree-wrapper">
      <h2 className="category-tree-title">전체 도서 카테고리</h2>

      <div>
        <div className="category-root" onClick={() => fetchCategories("DOMESTIC")}>
          {expandedType === "DOMESTIC" ? "▼" : "▶"} 국내 도서
        </div>
        {expandedType === "DOMESTIC" && renderCategoryTree(categoriesMap.DOMESTIC)}
      </div>

      <div>
        <div className="category-root" onClick={() => fetchCategories("FOREIGN")}>
          {expandedType === "FOREIGN" ? "▼" : "▶"} 해외 도서
        </div>
        {expandedType === "FOREIGN" && renderCategoryTree(categoriesMap.FOREIGN)}
      </div>
    </div>
  );
};

export default CategoryTree;
