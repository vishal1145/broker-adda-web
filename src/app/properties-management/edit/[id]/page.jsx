"use client";

import React from "react";
import NewPropertyPage from "../../new/page";
import { useParams } from "next/navigation";

const EditPropertyPage = () => {
  const params = useParams();
  const propertyId = params?.id;

  return <NewPropertyPage propertyId={propertyId} isEditMode={true} />;
};

export default EditPropertyPage;

