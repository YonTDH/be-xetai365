class SettingModel {
  constructor() {
    this.setting = {
      id: 1,
      title: "Xe Tai - Xe Dau Keo - Xe Chuyen Dung",
      keywords: "dongfeng, howo, hyundai, xe tai",
      description: "Thong tin cau hinh website va lien he cho XeTai365",
      giupdochiase: 3,
      ten: "XE TAI 365 GROUP",
      email: "vanducbon99@gmail.com",
      website: "https://xetai365.vn",
      dienthoai: "0899.966.254",
      diachi: "So 16, Duong Dan Cau Phu Long, Binh Duong",
      fax: "0899.966.254",
      tennv: "",
      hotline: "0899.966.254",
      tennv1: "",
      hotline1: "",
      tennv2: "",
      hotline2: "",
      toado: "",
      facebook: "https://www.facebook.com/profile.php?id=100072217597486",
      youtube: "https://www.youtube.com/channel/UC24fCjRcXuDH1dnbgGewb1A",
      yahoo: "",
      skype: "",
      twitter: "http://twitter.com",
      zing: "",
      google: "https://plus.google.com/u/0/",
      tip: "<button>Chat</button>",
      linktip: "",
      analytics: "",
      dangky: "",
      tietkiem:
        "<iframe src='https://www.google.com/maps/embed?pb=sample'></iframe>",
      hailong: "",
      updatedAt: new Date().toISOString(),
    };
  }

  get() {
    return this.setting;
  }

  update(partialPayload = {}) {
    this.setting = {
      ...this.setting,
      ...partialPayload,
      id: 1,
      updatedAt: new Date().toISOString(),
    };
    return this.setting;
  }
}

module.exports = new SettingModel();
