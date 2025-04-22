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

            const itemData = JSON.parse(button.getAttribute("data-bs-item"));
            const { specs, ...newItemData } = itemData;

            itemForm.action = `/dashboard/products/update-item?id=${itemData.id}`;

            for (const [itemInfo, value] of Object.entries(newItemData)) {
                itemForm[itemInfo].value = value;
            }

            Alpine.$data(itemSpecTable).specs = specs;
            Alpine.$data(itemSpecTable).specMap = Object.fromEntries(
                Object.keys(specs).map(spec => [spec, spec])
            );
        });
    }

    const productModal = document.getElementById("productModal");
    const productForm = document.forms.productForm;

    const productBaseSpecTable = document.getElementById("productBaseSpecTable");

    if (productModal) {
        productModal.addEventListener("show.bs.modal", event => {
            productForm.reset();

            const button = event.relatedTarget;

            if (button.getAttribute("data-bs-product")) {
                const productData = JSON.parse(button.getAttribute("data-bs-product"));
                const { baseSpecs, items, ...newProductData } = productData;

                console.log(newProductData);

                for (const [productInfo, value] of Object.entries(newProductData)) {
                    productForm[productInfo].value = value;
                }

                Alpine.$data(productBaseSpecTable).specs = baseSpecs;
                Alpine.$data(productBaseSpecTable).specMap = Object.fromEntries(
                    Object.keys(baseSpecs).map(spec => [spec, spec])
                );
            }
        });
    }
});