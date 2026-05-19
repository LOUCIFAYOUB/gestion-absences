declare module 'react-big-calendar' {
  import { ComponentType } from 'react';
  
  export interface CalendarProps {
    localizer: any;
    events: any[];
    startAccessor?: string;
    endAccessor?: string;
    style?: React.CSSProperties;
    eventPropGetter?: (event: any) => { style?: React.CSSProperties };
    culture?: string;
    messages?: Record<string, string>;
    [key: string]: any;
  }
  
  export const Calendar: ComponentType<<CalendarProps>;
  export function dateFnsLocalizer(config: any): any;
}