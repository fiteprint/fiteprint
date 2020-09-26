import React from 'react';
import { List, ListRowRenderer } from 'react-virtualized';

import Item, { ItemData } from './Item';

interface Props {
  items: ItemData[];
  showIcon: boolean;
}

export default function VisitedItemList(props: Props): JSX.Element {
  const rowRenderer: ListRowRenderer = ({ key, index, style }) => (
    <div key={key} style={style}>
      <Item item={props.items[index]} showIcon={props.showIcon} />
    </div>
  );
  return (
    <List
      width={400}
      height={500}
      rowHeight={50}
      rowCount={props.items.length}
      rowRenderer={rowRenderer}
      style={{
        outline: 0,
        padding: '8px 0',
      }}
    />
  );
}
