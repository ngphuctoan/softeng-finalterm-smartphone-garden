function renameKeys(obj, keyMap) {
    return Object.entries(obj).reduce((newObj, [key, value]) => {
        const newKey = keyMap[key] || key;
        newObj[newKey] = value;
        return newObj;
    }, {});
}

document.addEventListener("alpine:init", () => {
    const itemModal = document.getElementById("itemModal");
    const itemForm = document.forms.itemForm;

    const itemSpecTable = document.getElementById("itemSpecTable");

    if (itemModal) {
        itemModal.addEventListener("show.bs.modal", event => {
            itemForm.reset();

            const button = event.relatedTarget;

            if (button.getAttribute("data-bs-item")) {
                const itemData = JSON.parse(button.getAttribute("data-bs-item"));
                const { specs, ...newItemData } = itemData;

                itemForm.action = `/dashboard/products/update-item?id=${itemData.id}`;

                for (const [itemInfo, value] of Object.entries(newItemData)) {
                    itemForm[itemInfo].value = value;
                }

                setTimeout(() => {
                    Alpine.$data(itemSpecTable).specs = specs;
                    Alpine.$data(itemSpecTable).specMap = Object.fromEntries(
                        Object.keys(specs).map(spec => [spec, spec])
                    );
                }, 100);
            } else {
                itemForm.action = "/dashboard/products/add-item";
                itemForm.productId.value = button.getAttribute("data-bs-new-from");

                setTimeout(() => {
                    Alpine.$data(itemSpecTable).specs = {};
                    Alpine.$data(itemSpecTable).specMap = {};
                }, 100);
            }
        });
    }

    const productModal = document.getElementById("productModal");
    const productForm = document.forms.productForm;

    const productEditDetails = document.getElementById("productEditDetails");

    if (productModal) {
        productModal.addEventListener("show.bs.modal", event => {
            productForm.reset();

            const button = event.relatedTarget;

            if (button.getAttribute("data-bs-product")) {
                const productData = JSON.parse(button.getAttribute("data-bs-product"));
                const { tags, baseSpecs, items, createdAt, ...newProductData } = productData;

                productForm.action = `/dashboard/products/update-product?id=${productData.id}`;

                for (const [productInfo, value] of Object.entries(newProductData)) {
                    productForm[productInfo].value = value;
                }

                setTimeout(() => {
                    Alpine.$data(productEditDetails).tagsStr = tags.join();
                    Alpine.$data(productEditDetails).specs = baseSpecs;
                    Alpine.$data(productEditDetails).specMap = Object.fromEntries(
                        Object.keys(baseSpecs).map(spec => [spec, spec])
                    );
                }, 100);
            } else {
                productForm.action = "/dashboard/products/add-product";

                setTimeout(() => {
                    Alpine.$data(productEditDetails).tagsStr = "";
                    Alpine.$data(productEditDetails).specs = {};
                    Alpine.$data(productEditDetails).specMap = {};
                }, 100);
            }
        });
    }
});