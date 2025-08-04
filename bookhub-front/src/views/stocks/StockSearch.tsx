import { getStockById, getStocks } from '@/apis/stocks/Stock';
import { StockProps } from '@/components/types/StockProps';
import { StockResponseDto } from '@/dtos/stock/Stock.response.dto';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import StockDetail from './StockDetail';

const PAGE_SIZE = 10;

function StockSearch({ branches = [] }: StockProps) {
  const [cookies] = useCookies(['accessToken']);
  const token = cookies.accessToken;

  const [keyword, setKeyword] = useState('');
  const [branchId, setBranchId] = useState<number | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [stocks, setStocks] = useState<StockResponseDto[]>([]);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<StockResponseDto | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchPage = async (page: number) => {
    if (!token) return;
    try {
      const response = await getStocks(
        token,
        page,
        PAGE_SIZE,
        keyword.trim() || undefined,
        undefined,
        branchId || undefined,
      );
      if (response.code === 'SU' && response.data) {
        const data = response.data;
        if ('content' in data) {
          setStocks(data.content);
          setTotalPage(data.totalPages);
          setCurrentPage(data.currentPage);
        } else {
          setStocks(data as StockResponseDto[]);
          setTotalPage(1);
          setCurrentPage(0);
        }
      } else {
        console.error('목록 조회 실패', response.message);
      }
    } catch (err) {
      console.error('목록 조회 예외', err);
    }
  };

  useEffect(() => {
    fetchPage(0);
  }, [token, keyword, branchId]);

  const openDetailModal = async (id: number) => {
    if (!token) return;
    try {
      const response = await getStockById(id, token);
      if (response.code === 'SU' && response.data) {
        setSelectedDetail(response.data);
        setSelectedStockId(id);
        setIsDetailOpen(true);
      } else {
        alert(response.message);
      }
    } catch (err) {
      console.log('상세 조회 예외', err);
      alert('상세 조회 중 오류 발생');
    }
  };

  const handleDetailClose = () => {
    setSelectedDetail(null);
    setIsDetailOpen(false);
  };

  const goToPage = (page: number) => {
    if (page < 0 || page >= totalPage) return;
    fetchPage(page);
  };

  return (
    <div>
      <h2>재고 검색</h2>
      <div className=''>
        <input
          className='input-search'
          type='text'
          placeholder='제목검색'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && goToPage(0)}
        />
        <select
          className='input-search'
          value={branchId ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            setBranchId(v === '' ? undefined : Number(v));
          }}
        >
          <option value='' disabled>
            지점을 선택하세요
          </option>
          {branches.map((branch) => (
            <option key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </option>
          ))}
        </select>
        <button className='searchBtn' onClick={() => goToPage(0)}>
          검색
        </button>
      </div>
      <table className='table-policy'>
        <thead>
          <tr>
            <th>IDX</th>
            <th>책이름</th>
            <th>지점명</th>
            <th>권수</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, index) => (
            <tr key={s.stockId}>
              <td>{currentPage * PAGE_SIZE + index + 1}</td>
              <td>{s.bookTitle}</td>
              <td>{s.branchName}</td>
              <td>{s.amount}</td>
              <td>
                <button className='modifyBtn' onClick={() => openDetailModal(s.stockId)}>
                  보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='pagination'>
        <button className='' disabled={currentPage === 0} onClick={() => goToPage(currentPage - 1)}>
          이전
        </button>
        <span>
          {currentPage + 1}/{totalPage}
        </span>
        <button
          className=''
          disabled={currentPage + 1 >= totalPage}
          onClick={() => goToPage(currentPage + 1)}
        >
          다음
        </button>
      </div>

  {isDetailOpen && selectedDetail && selectedStockId != null && (
        <StockDetail isOpen={isDetailOpen} onClose={handleDetailClose} stockDetail={selectedDetail} />
      )}
    </div>
  );
}

export default StockSearch;

