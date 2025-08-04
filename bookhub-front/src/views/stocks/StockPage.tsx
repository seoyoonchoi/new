import { StockActionType } from '@/apis/enums/StockActionType';
import { getStockById, getStocks } from '@/apis/stocks/Stock';
import { StockProps } from '@/components/types/StockProps';
import { StockResponseDto, StockUpdateResponseDto } from '@/dtos/stock/Stock.response.dto';
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie';
import StockUpdate from './StockUpdate';

const PAGE_SIZE = 10;

function StockPage({
  branches = [],
}: StockProps) {

     const [cookies] = useCookies(['accessToken']);
     const token = cookies.accessToken;
   
     const [keyword, setKeyword] = useState('');
     const [stockActionType, setStockActionType] = useState<StockActionType | ''>('');
     const [branchId, setBranchId] = useState<number|undefined>(undefined);

     const [currentPage, setCurrentPage] = useState<number>(0);
     const [totalPage, setTotalPage] = useState<number>(0);
     const [stocks, setStocks] = useState<StockResponseDto[]>([]);
     const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
     const [selectedDetail, setSelectedDetail] = useState<StockUpdateResponseDto | null>(null);
   
     const [isUpdateOpen, setIsUpdateOpen] = useState(false);
   
     const fetchPage = async (page: number) => {
       if(!token) return;
       try{
           const response = await getStocks(
               token,
               page,
               PAGE_SIZE,
               keyword.trim() || undefined,
               stockActionType || undefined
           );
   
           if(response.code ==="SU" && response.data){
               const data = response.data;
               if("content" in data){
                   setStocks(data.content);
                   setTotalPage(data.totalPages);
                   setCurrentPage(data.currentPage);
               }else{
                   setStocks(data as StockResponseDto[]);
                   setTotalPage(1);
                   setCurrentPage(0);
               }
           }else{
               console.error("목록 조회 실패", response.message);
           }
       }catch (err){
           console.error("목록 조회 예외",err);
       }
     };
   
     useEffect(() => {
       fetchPage(0);
     },[token,keyword,stockActionType]);
   
    
     const openUpdateModal = async (id : number) => {
       if(!token) return;
       try{
           const response = await getStockById(id, token);
           if (response.code ==="SU" && response.data){
               setSelectedDetail(response.data);
               setSelectedStockId(id);
               setIsUpdateOpen(true);
           }else{
               alert(response.message);
           }
       }catch(err){
           console.error("상세 조회 예외",err);
           alert("상세 조회 중 오류 발생")
       }
     };
   
     const handleUpdateClose = () => {
       setSelectedDetail(null);
       setIsUpdateOpen(false);
     };
   
     const handleUpdated = () => {
       handleUpdateClose();
       fetchPage(currentPage);
     }
   
     const goToPage = (page : number) => {
       if(page<0 || page >=totalPage) return;
       fetchPage(page);
     };
       const goPrev = () => {
    if (currentPage > 0) goToPage(currentPage - 1);
  };
  const goNext = () => {
    if (currentPage < totalPage - 1) goToPage(currentPage + 1);
  };


       const startPage = Math.floor(currentPage / PAGE_SIZE) * PAGE_SIZE;
  const endPage = Math.min(startPage + PAGE_SIZE, totalPage);

  return (
    
    <div >
      <h2>재고 관리</h2>
        <div className=''>
            
           
        <input className = 'input-search' type="text" placeholder='제목검색' value={keyword} onChange={(e) => setKeyword(e.target.value) } onKeyDown={(e) =>e.key === "Enter" && goToPage(0)} />
        <select className='input-search' value={branchId ?? ''} onChange={e=> {
          const v = e.target.value
          setBranchId(v === ''? undefined : Number(v))
        }}>
          <option value="" disabled>지점을 선택하세요</option>
          {branches.map(branch => {return(
            <option key = {branch.id} value={branch.id}> {branch.name}</option>)
          })}

        </select>
       

    <button className='searchBtn' onClick={() => goToPage(0)}>검색</button>
        </div>
        <table >
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
                {stocks.map((s,index) => (
                    <tr key = {s.stockId}>
                        <td>{currentPage * PAGE_SIZE + index + 1}</td>
                        <td>{s.bookTitle}</td>
                        <td>{s.branchName}</td>
                        <td>{s.amount}</td>
                       
                        <td>
                            <button className = "modifyBtn" onClick={() => openUpdateModal(s.stockId)}>수정</button>
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
  <div className="footer">
        <button
          className="pageBtn"
          onClick={goPrev}
          disabled={currentPage === 0}
        >
          {"<"}
        </button>
        {Array.from(
          { length: endPage - startPage },
          (_, i) => startPage + i
        ).map((i) => (
          <button
            key={i}
            className={`pageBtn${i === currentPage ? " current" : ""}`}
            onClick={() => goToPage(i)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className="pageBtn"
          onClick={goNext}
          disabled={currentPage >= totalPage - 1}
        >
          {">"}
        </button>
        <span className="pageText">
          {totalPage > 0 ? `${currentPage + 1} / ${totalPage}` : "0 / 0"}
        </span>
      </div>

        {isUpdateOpen && selectedDetail && selectedStockId != null && (
            <StockUpdate
            isOpen={isUpdateOpen}
            onClose={handleUpdateClose}
            onUpdate={handleUpdated}
            stockDetail={selectedDetail}
            stockId={selectedStockId}/>
        )}


    </div>
  )
}

export default StockPage