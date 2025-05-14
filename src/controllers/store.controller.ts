import { ItemModel, ProductModel } from "@models";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getHomePage(req: Request, res: Response) {
    const carouselSlides = [
        {
            photo: {
                link: "1565536421966-1e4aec32c7e7",
                author: "alexandar_todov"
            },
            title: "Welcome to Smartphone Garden \u{1f338}",
            description: "Where your smartphone blossoms",
            align: "center",
            active: true,
            ctaButton: {
                href: "#bestSellers",
                label: "Our best-sellers!"
            }
        }, {
            photo: {
                link: "1600340048140-909329c17ac1",
                author: "itsomidarmin"
            },
            title: "Pick your perfect phone \u{1f4f1}",
            description: "From flagship beasts to budget-friendly buds",
            align: "end",
            active: false,
            ctaButton: {
                href: "/products/smartphones",
                label: "Browse for products"
            }
        }, {
            photo: {
                link: "1648553847712-b32cf94e7bd1?",
                author: "radoslavbali"
            },
            title: "For tech lovers, from tech lovers \u{2764}",
            description: "Curated, compared and delivered with care",
            align: "start",
            active: false,
            ctaButton: {
                href: "/contact",
                label: "Contact us"
            }
        }
    ];

    res.render("store/pages/index", {
        carouselSlides,
        activeNav: "/",
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        bestSellers: await ProductModel.getMostSales(4),
        newestArrivals: await ProductModel.getNewest(4),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

export async function getCategoryPage(req: Request, res: Response) {
    const category = req.params.category;
    const categoryPhotos = {
        smartphones: {
            link: "1596742578443-7682ef5251cd",
            author: "the_average_tech_guy"
        }
    };

    const { brand, priceRange } = req.query;
    let [gte, lte] = [0, 100000000];

    if (typeof priceRange === "string" && priceRange !== "") {
        [gte, lte] = priceRange.split("-").map(Number);
    }

    const products = await ProductModel.getFiltered({
        brand: brand || undefined,
        items: { some: { price: { gte, lte } } }
    });
    
    res.render("store/pages/category", {
        category,
        products,
        categoryPhotos,
        filteredBrand: brand,
        priceRange: [gte, lte],
        brands: await ProductModel.getAllBrands(),
        activeNav: `/products/${category}`,
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

export async function getProductPage(req: Request, res: Response) {
    const category = req.params.category;
    const id = req.params.productId;
    const product = await ProductModel.getById(id);

    if (product.category !== category) {
        res.redirect("/404");
        return;
    }

    let slides = ["/public/images/products/slide-notfound.jpg"];

    const previewDir = path.join(".", "public", "images", "products", id, "previews");

    try {
        slides = fs.readdirSync(previewDir)
            .filter(name => name.startsWith("slide-"))
            .map(name => "/" + path.join(previewDir, name));
    } catch {}

    let options: { [spec: string]: Set<string> } = ProductModel.getAllItemSpecs(product);
    let selectedOptions: { [spec: string]: string } = {};

    for (const spec of Object.keys(options)) {
        const queryValue = req.query[spec]?.toString();

        if (queryValue && options[spec].has(queryValue)) {
            selectedOptions[spec] = queryValue;
        } else {
            selectedOptions[spec] = Array.from(options[spec])[0];
        }
    }

    const availableItem = product.items.find(
        item => Object.entries(selectedOptions).every(
            ([spec, value]) => item.specs[spec] === value
        )
    );

    res.render("store/pages/product", {
        product,
        slides,
        options,
        selectedOptions,
        availableItem,
        activeNav: `/products/${product.category}`,
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

export async function getCartPage(req: Request, res: Response) {
    res.render("store/pages/cart", {
        cart: req.session.cart
            ? await Promise.all(
                Object.entries(req.session.cart).map(([itemId, amount]) =>
                    ItemModel.getById(Number(itemId)).then(async item => ({
                        ...item,
                        amount,
                        productName: (await ProductModel.getById(item.productId)).name
                    }))
                )
            )
            : [],
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

export async function addItemToCart(req: Request, res: Response) {
    const itemId = Number(req.query?.id);

    const item = await ItemModel.getById(itemId);

    if (!req.session.cart) {
        req.session.cart = {};
    }

    if (itemId in req.session.cart) {
        req.session.cart[itemId] = Math.min(req.session.cart[itemId] + 1, item.stock);
    } else {
        req.session.cart[itemId] = 1;
    }

    res.redirect("/cart");
}

export async function substractItemFromCart(req: Request, res: Response) {
    const itemId = Number(req.query?.id);

    if (req.session.cart && itemId in req.session.cart) {
        req.session.cart[itemId] = Math.max(req.session.cart[itemId] - 1, 1);

        res.send(req.session.cart[itemId]);
    }

    res.redirect("/cart");
}

export async function removeItemFromCart(req: Request, res: Response) {
    const itemId = Number(req.query?.id);

    if (req.session.cart) {
        delete req.session.cart[itemId];
    }

    res.redirect("/cart");
}

export async function emptyCart(req: Request, res: Response) {
    if (req.session.cart) {
        req.session.cart = {};
    }

    res.redirect("/cart");
}

export function getAboutPage(req: Request, res: Response) {
    res.render("store/pages/about", {
        activeNav: "/about",
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

export function get404Page(req: Request, res: Response) {
    res.render("store/pages/404", {
        userName: res.locals.userName,
        showDashboard: ["administrator", "manager"].includes(res.locals.roleName),
        cartCount: getCartItemsCount(req.session.cart)
    });
}

function getCartItemsCount(cart: Record<number, number> | undefined): number {
    return cart ? Object.keys(cart).length : 0;
}
