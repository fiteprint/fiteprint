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
  showIcon: boolean;
}

const HALF_SPACE_CHARS = '【（《“‘';
const FAVICON_BASE_URL = 'chrome://favicon/size/16@2x/';

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

interface IconProps {
  adjustMargin: boolean;
}

const Icon = styled.img<IconProps>`
  margin-right: ${({ adjustMargin }) => adjustMargin ? '' : '0.5em'};
  width: 1.25em;
  vertical-align: text-bottom;
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

export default function Item({ item, showIcon }: Props): JSX.Element {
  const [shouldAdjustMargin, setShouldAdjustMargin] = useState(false);
  useEffect(() => {
    setShouldAdjustMargin(shouldAdjustTitleMargin(item.shortUrl));
  }, [item.shortUrl]);

  const [formattedUrl, setFormattedUrl] = useState('');
  useEffect(() => {
    setFormattedUrl(decodeUrlForShowing(item.shortUrl));
  }, [item.shortUrl]);

  const [formattedTitle, setFormattedTitle] = useState('');
  useEffect(() => {
    setFormattedTitle(item.shortTitle || chrome.i18n.getMessage('noTitle'));
  }, [item.shortTitle]);

  const [formattedDate, setFormattedDate] = useState('');
  useEffect(() => {
    setFormattedDate(dateFromNow(new Date(item.lastVisitTime)));
  }, [item.lastVisitTime]);

  const [iconUrl, setIconUrl] = useState('');
  useEffect(() => {
    setIconUrl(getFaviconUrl(item.url));
  }, [item.url]);

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
    <Box
      onClick={handleClick}
      title={item.title + '\n' + decodeUrlForShowing(item.url)}>
      <Title
        highlight={item.tabIndex > -1}
        adjustMargin={!showIcon && shouldAdjustMargin}>
        {showIcon &&
          <Icon
            src={iconUrl}
            adjustMargin={shouldAdjustMargin}
          />
        }
        {formattedTitle}
      </Title>
      <Meta>{formattedDate} · {formattedUrl}</Meta>
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
