import { updatePublisher } from '@/apis/publisher/publisher';
import { PublisherRequestDto } from '@/dtos/publishers/publisher.request.dto';
import { PublisherResponseDto } from '@/dtos/publishers/publisher.response.dto';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import '@/styles/modal.css';

interface UpdatePublisherProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    publisherDetail: PublisherResponseDto;
    publisherId: number;
}

function UpdatePublisher({isOpen, onClose, onUpdate, publisherDetail, publisherId}:UpdatePublisherProps) {

    const [cookies] = useCookies(['accessToken']);
    const token = cookies.accessToken;
    const [publisherName, setPublisherName] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
      if(publisherDetail){
        setPublisherName(publisherDetail.publisherName);
        setMessage('');
      }
    }, [publisherDetail]);

    const onUpdateClick = async () => {
      if(!publisherName.trim()) {
        setMessage('출판사 이름을 입력하세요');
        return;
      }
      if (!token) {
            alert('인증 토큰이 없습니다.');
            return;
        }

        const dto : PublisherRequestDto = {
          publisherName
        };

        try{
          const response = await updatePublisher(publisherId,dto,token);
          if(response.code !=='SU'){
            setMessage(response.message || '수정 실패');
            return;
            }
            alert('출판사가 성공적으로 수정되었습니다');
            onUpdate();
            onClose();
        }catch(err){
          console.error('출판사 수정 중 예외', err);
          setMessage('정책 수정 중 예외 발생');
        }
    };

    if(!isOpen) return null;

      return (
        <div className="modalOverlay">
          <div className="modalContainer"><button className="modalCloseButton" onClick={onClose}>x</button>
          <h2 className="modalTitle">출판사 수정</h2>
          <div className="formGroup"><input type="text" value={publisherName} onChange={e => setPublisherName(e.target.value)} /></div>
          {message && <p className="errorMessage">{message}</p>}
          <div className="modalFooter">
                        <button onClick={onUpdateClick} className="">수정</button>
                    </div>

          </div></div>
      )
  }

  export default UpdatePublisher;
