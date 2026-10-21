
"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import { openApiSpec } from "@/lib/swagger/openapi";

export default function SwaggerClient() {
  return (
    <div className="min-h-screen bg-white text-black">
      <SwaggerUI spec={openApiSpec} />
    </div>
  );
}
