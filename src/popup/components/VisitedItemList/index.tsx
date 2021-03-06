import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { List, ListRowRenderer } from 'react-virtualized';

import Item, { ItemData } from './Item';
export { ItemData };

interface Props {
  items: ItemData[];
  total: number;
  domain: string;
}

const ITEM_HEIGHT = 55;
const MAX_HEIGHT = 500;
const WIDTH = 400;

const Empty = styled.div`
  padding: 1em 0;
  width: ${WIDTH}px;
  text-align: center;
  color: #999;
`;

export default function VisitedItemList(props: Props): JSX.Element {
  const listRef = useRef<List>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  useEffect(() => {
    setHighlightIndex(-1);
    listRef.current?.scrollToPosition(0);
  }, [props.items]);

  const openItem = (item: ItemData, mustInNewTab?: boolean) => {
    if (item.tabIndex > -1) {
      chrome.tabs.highlight({
        tabs: item.tabIndex,
      });
    } else if (props.domain || mustInNewTab) {
      chrome.tabs.create({
        url: item.url,
      });
    } else {
      chrome.tabs.update({
        url: item.url,
      });
    }
    window.close();
  };

  const listener = (event: KeyboardEvent) => {
    const offset = event.shiftKey ? 10 : 1;
    switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      setHighlightIndex(index => {
        return Math.min(index + offset, props.items.length - 1);
      });
      break;
    case 'ArrowUp':
      event.preventDefault();
      setHighlightIndex(index => {
        return index === -1
          ? props.items.length - 1
          : Math.max(index - offset, 0);
      });
      break;
    case 'Enter':
      event.preventDefault();
      if (props.items[highlightIndex]) {
        openItem(props.items[highlightIndex], event.shiftKey);
      }
      break;
    }
  };

  const listenerRef = useRef(listener);
  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => {
    const callback = (event: KeyboardEvent) => listenerRef.current(event);
    document.addEventListener('keydown', callback, true);
    return () => {
      document.removeEventListener('keydown', callback, true);
    };
  }, []);

  const rowRenderer: ListRowRenderer = ({ key, index, style }) => (
    <div key={key} style={style}>
      <Item
        item={props.items[index]}
        highlight={index === highlightIndex}
        onClick={item => openItem(item)}
        onMouseMiddleClick={item => openItem(item, true)}
      />
    </div>
  );

  return (
    <>
      {props.total > 0 ?
        <List
          ref={listRef}
          width={WIDTH}
          height={Math.min(MAX_HEIGHT, props.total * ITEM_HEIGHT)}
          rowHeight={ITEM_HEIGHT}
          rowCount={props.items.length}
          rowRenderer={rowRenderer}
          scrollToIndex={highlightIndex}
          style={{
            outline: 0,
            padding: '12px 0',
            boxSizing: 'content-box',
          }}
        />
        :
        <Empty>{chrome.i18n.getMessage('noBrowsingHistory')}</Empty>
      }
    </>
  );
}
