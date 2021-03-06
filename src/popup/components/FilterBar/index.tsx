import React, { useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';

import { getMainDomain } from 'common/url';

interface Props {
  domain: string;
  isStrict: boolean;
  canSwitchMode: boolean;
  onSwitchMode: () => void;
  onInput: (value: string) => void;
}

const Box = styled.div`
  display: flex;
  height: 40px;
  box-shadow: #eaeaea 0px 0px 5px;
  border-top: solid 1px #ddd;
`;

interface InputProps {
  passive: boolean;
}

const hideCaret = css`
  caret-color: transparent;
`;

const Input = styled.input<InputProps>`
  flex: 1 1 auto;
  padding: 0 10px;
  height: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  ${({ passive }) => passive ? '' : hideCaret}
`;

const SwitchModeButton = styled.button`
  padding: 0.2em 10px 0 10px;
  line-height: 1;
  color: #bbb;
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  &:hover {
    color: #999;
  }
`;

export default function FilterBar(props: Props): JSX.Element {
  const [passive, setPassive] = useState(false);

  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current.focus();
  }, []);

  const handleClick = () => {
    setPassive(true);
  };

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    props.onInput(event.currentTarget.value.trim());
    setPassive(true);
  };

  const handleBlur = () => {
    input.current.focus();
  };

  const placeholder = props.domain
    ? chrome.i18n.getMessage('filter') + (
      ' ' + (props.isStrict ? props.domain : '*.' + getMainDomain(props.domain)))
    : chrome.i18n.getMessage('filterItems');

  return (
    <Box>
      <Input
        spellCheck={false}
        placeholder={placeholder}
        passive={passive}
        onInput={handleInput}
        onBlur={handleBlur}
        onClick={handleClick}
        ref={input}
      />
      {props.canSwitchMode && (
        <SwitchModeButton onClick={props.onSwitchMode}>
          {props.isStrict ? (
            <svg
              style={{ width: '16px', height: '16px' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
            </svg>
          ) : (
            <svg
              style={{ width: '16px', height: '16px' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path>
            </svg>
          )}
        </SwitchModeButton>
      )}
    </Box>
  );
}
