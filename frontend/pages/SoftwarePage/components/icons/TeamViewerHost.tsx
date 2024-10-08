import React from "react";

import type { SVGProps } from "react";

const AppStore = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
    <path fill="#515774" d="M0 0h32v32H0z" />
    <path
      d="m15.96 7.564.648-1.12A1.458 1.458 0 1 1 19.136 7.9l-6.244 10.808h4.516c1.464 0 2.284 1.72 1.648 2.912H5.816a1.451 1.451 0 0 1-1.456-1.456c0-.808.648-1.456 1.456-1.456h3.712l4.752-8.236-1.484-2.576a1.46 1.46 0 0 1 2.528-1.456l.636 1.124ZM10.344 23.12l-1.4 2.428a1.458 1.458 0 1 1-2.528-1.456l1.04-1.8c1.176-.364 2.132-.084 2.888.828ZM22.4 18.716h3.788c.808 0 1.456.648 1.456 1.456 0 .808-.648 1.456-1.456 1.456h-2.104l1.42 2.464a1.46 1.46 0 0 1-2.528 1.456c-2.392-4.148-4.188-7.252-5.38-9.32-1.22-2.104-.348-4.216.512-4.932.956 1.64 2.384 4.116 4.292 7.42Z"
      fill="#fff"
    />
  </svg>
);
export default AppStore;