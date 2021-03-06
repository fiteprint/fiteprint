import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { getUrlOrigin } from 'common/url';

export interface ItemData {
  key: number;
  title: string;
  shortTitle: string;
  url: string;
  shortUrl: string;
  tabIndex: number;
  lastVisitTime: number;
}

interface Props {
  item: ItemData;
  highlight: boolean;
  onClick: (item: ItemData) => void;
  onMouseMiddleClick: (item: ItemData) => void;
}

const HALF_SPACE_CHARS = '【（《“‘';
const FAVICON_BASE_URL = 'chrome://favicon/size/16@2x/';

const ellipsis = css`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

interface BoxProps {
  highlight: boolean;
}

const Box = styled.div<BoxProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  height: 100%;
  background-color: ${({ highlight }) => highlight ? '#e9e9e9' : ''};
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    background-color: #f9f9f9;
  }
`;

interface IconProps {
  adjustMargin: boolean;
}

const Icon = styled.img<IconProps>`
  display: inline-block;
  margin-right: ${({ adjustMargin }) => adjustMargin ? '0.3em' : '0.8em'};
  width: 1.25em;
  vertical-align: text-bottom;
`;

interface TitleProps {
  highlight: boolean;
}

const Title = styled.div<TitleProps>`
  font-weight: ${({ highlight }) => highlight ? 'bold' : ''};
  ${ellipsis}
`;

const Meta = styled.div`
  margin-top: 5px;
  margin-left: 2.05em;
  color: #999;
  ${ellipsis}
`;

export default function Item(props: Props): JSX.Element {
  const { item, highlight, onClick, onMouseMiddleClick } = props;

  const [shouldAdjustMargin, setShouldAdjustMargin] = useState(false);
  useEffect(() => {
    setShouldAdjustMargin(shouldAdjustTitleMargin(item.shortTitle));
  }, [item.shortTitle]);

  const [formattedTitle, setFormattedTitle] = useState('');
  useEffect(() => {
    setFormattedTitle(item.shortTitle || chrome.i18n.getMessage('noTitle'));
  }, [item.shortTitle]);

  const [formattedUrl, setFormattedUrl] = useState('');
  useEffect(() => {
    setFormattedUrl(decodeUrlForShowing(item.shortUrl));
  }, [item.shortUrl]);

  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setFormattedDate(dateFromNow(new Date(item.lastVisitTime)));
  }, [item.lastVisitTime]);

  const [iconUrl, setIconUrl] = useState('');
  useEffect(() => {
    setIconUrl(getFaviconUrl(item.url));
  }, [item.url]);

  const handleClick = () => {
    onClick(item);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button === 1) {
      event.preventDefault();
      onMouseMiddleClick(item);
    }
  };

  return (
    <Box
      highlight={highlight}
      title={[
        item.title, 
        decodeUrlForShowing(item.url),
        '---',
        formattedDate,
      ].join('\n')}
      onClick={handleClick}
      onMouseDown={handleMouseDown}>
      <Title highlight={item.tabIndex > -1}>
        <Icon src={iconUrl} adjustMargin={shouldAdjustMargin} />
        {formattedTitle}
      </Title>
      <Meta>
        {formattedUrl}
      </Meta>
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
    return hours + chrome.i18n.getMessage('hoursAgo');
  }

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes) {
    return minutes + chrome.i18n.getMessage('minutesAgo');
  }

  return chrome.i18n.getMessage('justNow');
}

function prefixZero(val: number, size: number): string {
  return (Array(size).join('0') + val).slice(-size);
}

function getFaviconUrl(url: string): string {
  return FAVICON_BASE_URL + getUrlOrigin(url);
}

function shouldAdjustTitleMargin(title: string): boolean {
  return HALF_SPACE_CHARS.includes(title[0]);
}

function decodeUrlForShowing(url: string): string {
  try {
    return decodeURIComponent(url).replace(/\n/g, ' ');
  } catch {
    return url;
  }
}
