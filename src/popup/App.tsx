import React, { useState, useEffect, useCallback } from 'react';

import { getVisitedItems } from 'background/bridge';
import VisitedItemList from './components/VisitedItemList';

export default function App(): JSX.Element {
  const [items, setItems] = useState([]);

  const init = useCallback(async() => {
    setItems(await getVisitedItems());
  }, []);

  useEffect(() => {
    init();
  }, []);

  return (
    <VisitedItemList items={items} showIcon={false} />
  );
}
