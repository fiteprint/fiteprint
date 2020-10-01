import React, { useEffect, useState, useRef } from 'react';
import styled, { css } from 'styled-components';

interface Props {
  domain: string;
  loading: boolean;
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

export default function FilterBar(props: Props): JSX.Element {
  const [placeholder, setPlaceholder] = useState('');
  useEffect(() => {
    if (props.loading) {
      setPlaceholder('');
      return;
    }
    const placeholder = props.domain
      ? chrome.i18n.getMessage('filter') + ' ' + props.domain
      : chrome.i18n.getMessage('filterItems');
    setPlaceholder(placeholder);
  }, [props.domain, props.loading]);

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

  return (
    <Box>
      <Input
        placeholder={placeholder}
        passive={passive}
        onInput={handleInput}
        onClick={handleClick}
        ref={input}
      />
    </Box>
  );
}
