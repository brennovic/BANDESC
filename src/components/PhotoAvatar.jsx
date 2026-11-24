import { useEffect, useState } from 'react';
import { getInitials } from '../utils/format.js';

export default function PhotoAvatar({ student, size = '' }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [student?.fotoUrl]);

  const showImage = Boolean(student?.autorizouFoto && student?.fotoUrl && !imageFailed);

  return (
    <span className={`person-avatar ${size}`.trim()} aria-hidden="true">
      {showImage ? (
        <img
          src={student.fotoUrl}
          alt={`Foto de ${student.name}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{getInitials(student?.name)}</span>
      )}
    </span>
  );
}
