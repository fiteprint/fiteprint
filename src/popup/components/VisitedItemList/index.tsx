import React from 'react';
import { List, ListRowRenderer } from 'react-virtualized';

import Item, { ItemData } from './Item';
export { ItemData };

interface Props {
  items: ItemData[];
  total: number;
  showIcon: boolean;
}

const ITEM_HEIGHT = 50;
const MAX_HEIGHT = 400;
const WIDTH = 400;

export default function VisitedItemList(props: Props): JSX.Element {
  const rowRenderer: ListRowRenderer = ({ key, index, style }) => (
    <div key={key} style={style}>
      <Item item={props.items[index]} showIcon={props.showIcon} />
    </div>
  );
  return (
    <List
      width={WIDTH}
      height={Math.min(MAX_HEIGHT, props.total * ITEM_HEIGHT)}
      rowHeight={ITEM_HEIGHT}
      rowCount={props.items.length}
      rowRenderer={rowRenderer}
      style={{
        outline: 0,
        padding: '8px 0',
        boxSizing: 'content-box',
      }}
    />
  );
}
