import React from "react";
import VendorGrid from "../components/vendors/VendorGrid";

export function VendorsPage({ vendors, onOpenAddModal, onSelectVendorForAnalysis }) {
    return (
        <div>
            <VendorGrid
                vendors={vendors}
                onOpenAddModal={onOpenAddModal}
                onSelectVendorForAnalysis={onSelectVendorForAnalysis}
            />
        </div>
    );
}

export default VendorsPage;
