import React from 'react';
import './TagChip.css';

const TagChip = ({ tag, onRemove }) => (
  <span className="tag-chip">
    {tag}
    <button type="button" className="remove-btn" onClick={() => onRemove(tag)}>
      ✕
    </button>
  </span>
);

export default TagChip;
