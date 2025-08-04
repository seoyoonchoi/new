import { StockActionType } from '@/apis/enums/StockActionType';
import { updateStock } from '@/apis/stocks/Stock';
import { StockUpdateRequestDto } from '@/dtos/stock/Stock.request.dto';
import { StockResponseDto } from '@/dtos/stock/Stock.response.dto';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import styles from '@/styles/stock/stockModal.module.css';

interface UpdateStockProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  stockDetail: StockResponseDto;
  stockId: number;
}

function StockUpdate({ isOpen, onClose, onUpdate, stockDetail, stockId }: UpdateStockProps) {
  const [cookies] = useCookies(['accessToken']);
  const token = cookies.accessToken;
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [stockActionType, setStockActionType] = useState<StockActionType>(StockActionType.IN);
  const [employeeId] = useState<number>(0);
  const [bookIsbn, setBookIsbn] = useState('');
  const [branchId, setBranchId] = useState<number>(0);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (stockDetail) {
      setAmount(stockDetail.amount);
      setBookIsbn(stockDetail.isbn);
      setBranchId(stockDetail.branchId);
      setMessage('');
    }
  }, [stockDetail]);

  const onUpdateClick = async () => {
    if (!token) {
      alert('인증 토큰이 없습니다.');
      return;
    }

    const dto: StockUpdateRequestDto = {
      stockActionType,
      employeeId,
      bookIsbn,
      branchId,
      amount,
      description,
    };

    try {
      const response = await updateStock(stockId, dto, token);
      if (response.code !== 'SU') {
        setMessage(response.message || '수정 실패');
        return;
      }
      alert('재고가 성공적으로 수정되었습니다');
      onUpdate();
      onClose();
    } catch (err) {
      console.error('정책 수정 중 예외', err);
      setMessage('정책 수정 중 예외 발생');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles['modal-overlay']}`}>
      <div className={`${styles['policy-detail-modal']}`}>
        <button className={`${styles['modal-close-button']}`} onClick={onClose}>
          x
        </button>
        <h2>재고 수정</h2>
        <div className='form-group'>
          <label>재고 타입</label>
          <select value={stockActionType} onChange={(e) => setStockActionType(e.target.value as StockActionType)}>
            <option value={StockActionType.IN}>입고</option>
            <option value={StockActionType.OUT}>출고</option>
            <option value={StockActionType.LOSS}>손실</option>
          </select>
        </div>

        <div className='form-group'>
          <label>책 ISBN</label>
          <input
            type='text'
            placeholder='책 ISBN을 입력하세요'
            value={bookIsbn}
            onChange={(e) => setBookIsbn(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <label>설명</label>
          <textarea
            placeholder='재고 이동 설명을 입력하세요'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className=''>
          <label>재고 변경 수량</label>
          <input
            type='number'
            placeholder='재고변경 수량을 입력해주세요'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {message && <p className='error-message'>{message}</p>}
        <div className='modal-footer'>
          <button onClick={onUpdateClick} className=''>
            수정
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockUpdate;

