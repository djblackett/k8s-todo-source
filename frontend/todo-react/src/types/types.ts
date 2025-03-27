export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  orderIndex: number;
}

export interface UpdateOrderIndex {
  id: string;
  orderIndex: number;
}
