document.addEventListener("alpine:init", () => {
    const itemModal = document.getElementById("itemModal");
    const itemForm = document.forms.itemForm;

    const itemSpecTable = document.getElementById("itemSpecTable");

    if (itemModal) {
        itemModal.addEventListener("show.bs.modal", event => {
            const button = event.relatedTarget;

            const itemData = JSON.parse(button.getAttribute("data-bs-item"));
            const { specs, ...newItemData } = itemData;

            for (const [itemInfo, value] of Object.entries(newItemData)) {
                itemForm[itemInfo].value = value;
            }

            Alpine.$data(itemSpecTable).specs = specs;
            Alpine.$data(itemSpecTable).newSpecKeys = Object.keys(specs)
                .reduce((newSpecKeys, spec) => {
                    newSpecKeys[spec] = spec;
                    return newSpecKeys;
                }, {});
        });
    }
});