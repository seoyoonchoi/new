
import { StockResponseDto } from '@/dtos/stock/Stock.response.dto';
import '@/styles/modal.css';

interface StockDetailProps {
    isOpen: boolean;
    onClose : () => void;
    stockDetail : StockResponseDto;
}

function StockDetail({isOpen, onClose, stockDetail}:StockDetailProps) {
  if(!isOpen) return null;

  return (
    <div className="modalOverlay">
        <div className="modalContainer">
            <button className="modalCloseButton" onClick={onClose}>x</button>
            <h2 className="modalTitle">재고 상세 조회</h2>
            <table className="detailTable">
                <tbody>
                    <tr>
                        <th>책 제목</th>
                        <td>{stockDetail.bookTitle}</td>
                    </tr>
                    <tr>
                        <th>지점</th>
                        <td>{stockDetail.branchName}</td>
                    </tr>
                    
                
                    <tr>
                        <th>재고량</th>
                        <td>{stockDetail.amount}</td>
                    </tr>
                    

                </tbody>
                
            </table>
            
        </div>
    </div>
  );
};

export default StockDetail;