import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { List, ListRowRenderer } from 'react-virtualized';

import Item, { ItemData } from './Item';
export { ItemData };

interface Props {
  items: ItemData[];
  total: number;
  showIcon: boolean;
}

const ITEM_HEIGHT = 50;
const MAX_HEIGHT = 500;
const WIDTH = 400;

const Empty = styled.div`
  padding: 1em 0;
  width: ${WIDTH}px;
  text-align: center;
  color: #999;
`;

export default function VisitedItemList(props: Props): JSX.Element {
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [props.items]);

  const openItem = (item: ItemData) => {
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

  const listener = (event: KeyboardEvent) => {
    switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      setHighlightIndex(index => {
        return index < props.items.length - 1 ? index + 1 : index;
      });
      break;
    case 'ArrowUp':
      event.preventDefault();
      setHighlightIndex(index => {
        return index > 0 ? index - 1 : index;
      });
      break;
    case 'Enter':
      event.preventDefault();
      if (props.items[highlightIndex]) {
        openItem(props.items[highlightIndex]);
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
        showIcon={props.showIcon}
        highlight={index === highlightIndex}
        onClick={openItem}
      />
    </div>
  );

  return (
    <>
      {props.total > 0 ?
        <List
          width={WIDTH}
          height={Math.min(MAX_HEIGHT, props.total * ITEM_HEIGHT)}
          rowHeight={ITEM_HEIGHT}
          rowCount={props.items.length}
          rowRenderer={rowRenderer}
          scrollToIndex={highlightIndex}
          style={{
            outline: 0,
            padding: '8px 0',
            boxSizing: 'content-box',
          }}
        />
        :
        <Empty>{chrome.i18n.getMessage('noBrowsingHistory')}</Empty>
      }
    </>
  );
}
