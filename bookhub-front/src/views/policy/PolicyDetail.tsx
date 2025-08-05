import { PolicyType } from '@/apis/enums/PolicyType';
import { PolicyDetailResponseDto } from '@/dtos/policy/Policy.response.dto';
import '@/styles/modal.css';

interface PolicyDetailProps {
    isOpen: boolean;
    onClose : () => void;
    policyDetail : PolicyDetailResponseDto;
    
}

function PolicyDetail({isOpen, onClose, policyDetail}:PolicyDetailProps) {
  if(!isOpen) return null;

  return (
    <div className="modalOverlay">
        <div className="modalContainer">
            <button className="modalCloseButton" onClick={onClose}>x</button>
            <h2 className="modalTitle">정책 상세 조회</h2>
            <table className="detailTable">
                <tbody>
                    <tr>
                        <th>제목</th>
                        <td>{policyDetail.policyTitle}</td>
                    </tr>
                    <tr>
                        <th>기간</th>
                        <td>{policyDetail.startDate}-{policyDetail.endDate}</td>
                    </tr>
                    
                        {policyDetail.policyType == PolicyType.TOTAL_PRICE_DISCOUNT && (
                            <tr>
                            <th>기준금액</th>
                            <td>{policyDetail.totalPriceAchieve.toLocaleString()}원</td>
                            </tr>
                        )}
                        
                    
                    <tr>
                        <th>할인율</th>
                        <td>{policyDetail.discountPercent}</td>
                    </tr>
                    <tr>
                        <th>타입</th>
                        <td>{policyDetail.policyType}</td>
                    </tr>
                    <tr>
                        <th>설명</th>
                        <td>{policyDetail.policyDescription || '-'}</td>
                    </tr>

                </tbody>
                
            </table>
            
        </div>
    </div>
  );
};

export default PolicyDetail;