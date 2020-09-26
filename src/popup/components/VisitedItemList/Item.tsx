import React from 'react';
import styled, { css } from 'styled-components';

export interface ItemData {
  key: number;
  title: string;
  url: string;
  iconUrl: string | null;
  tabIndex: number;
  lastVisitTime: number;
}

interface Props {
  item: ItemData;
  showIcon: boolean;
}

const HALF_SPACE_CHARS = '【（《“‘';

const ellipsis = css`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  height: 100%;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
`;

interface TitleProps {
  highlight: boolean;
  adjustMargin: boolean;
}

const Title = styled.div<TitleProps>`
  margin-left: ${({ adjustMargin }) => adjustMargin ? '-0.5em' : ''};
  font-weight: ${({ highlight }) => highlight ? 'bold' : ''};
  ${ellipsis}
`;

const Meta = styled.div`
  margin-top: 5px;
  font-size: 0.9em;
  color: #999;
  ${ellipsis}
`;

export default function Item({ item }: Props): JSX.Element {
  const handleClick = () => {
    if (item.tabIndex > -1) {
      chrome.tabs.highlight({
        tabs: item.tabIndex,
      });
      window.close();
    } else {
      chrome.tabs.create({
        url: item.url,
      });
    }
  };
  return (
    <Box onClick={handleClick}>
      <Title
        highlight={item.tabIndex > -1}
        adjustMargin={HALF_SPACE_CHARS.includes(item.title[0])}>
        {item.title || chrome.i18n.getMessage('noTitle')}
      </Title>
      <Meta>{dateFromNow(new Date(item.lastVisitTime))} · {item.url}</Meta>
    </Box>
  );
}

function dateFromNow(date: Date): string {
  const diff = Date.now() - date.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days) {
    const months = prefixZero(date.getMonth() + 1, 2);
    const dates = prefixZero(date.getDate(), 2);
    return months + '-' + dates;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours) {
    return hours + ' ' + chrome.i18n.getMessage('hoursAgo');
  }

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes) {
    return minutes + ' ' + chrome.i18n.getMessage('minutesAgo');
  }

  return chrome.i18n.getMessage('justNow');
}

function prefixZero(val: number, size: number): string {
  return (Array(size).join('0') + val).slice(-size);
}
