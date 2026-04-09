class VehicleModel {
  constructor() {
    this.vehicles = this.buildSeedVehicles();
    this.nextId = this.vehicles.length + 1;
  }

  buildSeedVehicles() {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        slug: "dongfeng-b180-2023",
        title: "Dongfeng B180 thung bat 2023",
        brand: "Dongfeng",
        type: "truck",
        condition: "used",
        year: 2023,
        mileageKm: 32000,
        fuelType: "diesel",
        transmission: "manual",
        priceVnd: 890000000,
        status: "available",
        location: "Binh Duong",
        thumbnail:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        slug: "hyundai-hd72-2022",
        title: "Hyundai HD72 thung kin 2022",
        brand: "Hyundai",
        type: "truck",
        condition: "used",
        year: 2022,
        mileageKm: 41000,
        fuelType: "diesel",
        transmission: "manual",
        priceVnd: 760000000,
        status: "available",
        location: "TP Ho Chi Minh",
        thumbnail:
          "https://images.unsplash.com/photo-1493238792000-8113da705763",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        slug: "isuzu-frr-90n-2024",
        title: "Isuzu FRR 90N 2024",
        brand: "Isuzu",
        type: "truck",
        condition: "new",
        year: 2024,
        mileageKm: 0,
        fuelType: "diesel",
        transmission: "manual",
        priceVnd: 1250000000,
        status: "available",
        location: "Dong Nai",
        thumbnail:
          "https://images.unsplash.com/photo-1471478331149-c72f17e33c73",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        slug: "howo-a7-dau-keo-2021",
        title: "Howo A7 dau keo 2021",
        brand: "Howo",
        type: "tractor-head",
        condition: "used",
        year: 2021,
        mileageKm: 98000,
        fuelType: "diesel",
        transmission: "manual",
        priceVnd: 1320000000,
        status: "sold",
        location: "Long An",
        thumbnail:
          "https://images.unsplash.com/photo-1551830820-330a71b99659",
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  list({ page = 1, limit = 20, keyword = "", brand = "", status = "" } = {}) {
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const safeKeyword = String(keyword || "").trim().toLowerCase();
    const safeBrand = String(brand || "").trim().toLowerCase();
    const safeStatus = String(status || "").trim().toLowerCase();

    const filtered = this.vehicles.filter((item) => {
      const matchKeyword =
        safeKeyword.length === 0 ||
        item.title.toLowerCase().includes(safeKeyword) ||
        item.slug.toLowerCase().includes(safeKeyword);
      const matchBrand =
        safeBrand.length === 0 || item.brand.toLowerCase() === safeBrand;
      const matchStatus =
        safeStatus.length === 0 || item.status.toLowerCase() === safeStatus;
      return matchKeyword && matchBrand && matchStatus;
    });

    const start = (safePage - 1) * safeLimit;
    const items = filtered.slice(start, start + safeLimit);

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / safeLimit),
      },
    };
  }

  findById(id) {
    const safeId = Number(id);
    return this.vehicles.find((item) => item.id === safeId) || null;
  }

  create(payload) {
    const now = new Date().toISOString();
    const vehicle = {
      id: this.nextId,
      slug: payload.slug,
      title: payload.title,
      brand: payload.brand,
      type: payload.type || "truck",
      condition: payload.condition || "used",
      year: Number(payload.year),
      mileageKm: Number(payload.mileageKm || 0),
      fuelType: payload.fuelType || "diesel",
      transmission: payload.transmission || "manual",
      priceVnd: Number(payload.priceVnd),
      status: payload.status || "available",
      location: payload.location || "",
      thumbnail: payload.thumbnail || "",
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.unshift(vehicle);
    this.nextId += 1;
    return vehicle;
  }

  update(id, payload) {
    const vehicle = this.findById(id);
    if (!vehicle) {
      return null;
    }

    Object.assign(vehicle, payload, {
      id: vehicle.id,
      updatedAt: new Date().toISOString(),
    });
    return vehicle;
  }

  delete(id) {
    const safeId = Number(id);
    const index = this.vehicles.findIndex((item) => item.id === safeId);
    if (index < 0) {
      return false;
    }

    this.vehicles.splice(index, 1);
    return true;
  }
}

module.exports = new VehicleModel();
