"use client";

import React from "react";
import { PropertyFormPage } from "../../new/page";

const EditPropertyPage = ({ params }) => {
  const propertyId = params?.id ?? null;

  return <PropertyFormPage propertyId={propertyId} isEditMode={true} />;
};

export default EditPropertyPage;

