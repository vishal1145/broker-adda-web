"use client";

export const metadata = {
  title: 'Edit Property | Update Property Listing | Broker Gully',
  description: 'Edit and update your property listing details on Broker Gully. Modify information, photos, amenities, and pricing.',
};

import React from "react";
import NewPropertyPage from "../../new/page";
import { useParams } from "next/navigation";

const EditPropertyPage = () => {
  const params = useParams();
  const propertyId = params?.id;

  return <NewPropertyPage propertyId={propertyId} isEditMode={true} />;
};

export default EditPropertyPage;

