const { getPool } = require("../config/db");

function mapSettingRow(row) {
  return {
    id: row.id,
    title: row.title,
    keywords: row.keywords,
    description: row.description,
    giupdochiase: row.giupdochiase,
    ten: row.ten,
    email: row.email,
    website: row.website,
    logoUrl: row.logo_url,
    dienthoai: row.dienthoai,
    diachi: row.diachi,
    fax: row.fax,
    tennv: row.tennv,
    hotline: row.hotline,
    tennv1: row.tennv1,
    hotline1: row.hotline1,
    tennv2: row.tennv2,
    hotline2: row.hotline2,
    toado: row.toado,
    facebook: row.facebook,
    youtube: row.youtube,
    zalo: row.zalo,
    skype: row.skype,
    twitter: row.twitter,
    zing: row.zing,
    google: row.google,
    tip: row.tip,
    linktip: row.linktip,
    analytics: row.analytics,
    dangky: row.dangky,
    tietkiem: row.tietkiem,
    hailong: row.hailong,
    updatedAt: row.updated_at,
  };
}

class SettingModel {
  async get() {
    const result = await getPool().query(
      `
      SELECT
        id, title, keywords, description, giupdochiase, ten, email, website, logo_url,
        dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
        hotline2, toado, facebook, youtube, zalo, skype, twitter, zing,
        google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
      FROM settings
      WHERE id = 1
      LIMIT 1
      `
    );

    if (result.rowCount === 0) {
      return null;
    }

    return mapSettingRow(result.rows[0]);
  }

  async update(partialPayload = {}) {
    const current = await this.get();
    const merged = {
      ...(current || {}),
      ...(partialPayload || {}),
      id: 1,
    };

    const result = await getPool().query(
      `
      INSERT INTO settings (
        id, title, keywords, description, giupdochiase, ten, email, website, logo_url,
        dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
        hotline2, toado, facebook, youtube, zalo, skype, twitter, zing,
        google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
      )
      VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        keywords = EXCLUDED.keywords,
        description = EXCLUDED.description,
        giupdochiase = EXCLUDED.giupdochiase,
        ten = EXCLUDED.ten,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        logo_url = EXCLUDED.logo_url,
        dienthoai = EXCLUDED.dienthoai,
        diachi = EXCLUDED.diachi,
        fax = EXCLUDED.fax,
        tennv = EXCLUDED.tennv,
        hotline = EXCLUDED.hotline,
        tennv1 = EXCLUDED.tennv1,
        hotline1 = EXCLUDED.hotline1,
        tennv2 = EXCLUDED.tennv2,
        hotline2 = EXCLUDED.hotline2,
        toado = EXCLUDED.toado,
        facebook = EXCLUDED.facebook,
        youtube = EXCLUDED.youtube,
        zalo = EXCLUDED.zalo,
        skype = EXCLUDED.skype,
        twitter = EXCLUDED.twitter,
        zing = EXCLUDED.zing,
        google = EXCLUDED.google,
        tip = EXCLUDED.tip,
        linktip = EXCLUDED.linktip,
        analytics = EXCLUDED.analytics,
        dangky = EXCLUDED.dangky,
        tietkiem = EXCLUDED.tietkiem,
        hailong = EXCLUDED.hailong,
        updated_at = NOW()
      RETURNING
        id, title, keywords, description, giupdochiase, ten, email, website, logo_url,
        dienthoai, diachi, fax, tennv, hotline, tennv1, hotline1, tennv2,
        hotline2, toado, facebook, youtube, zalo, skype, twitter, zing,
        google, tip, linktip, analytics, dangky, tietkiem, hailong, updated_at
      `,
      [
        merged.title || "",
        merged.keywords || "",
        merged.description || "",
        Number(merged.giupdochiase) || 0,
        merged.ten || "",
        merged.email || "",
        merged.website || "",
        merged.logoUrl || merged.logo_url || "",
        merged.dienthoai || "",
        merged.diachi || "",
        merged.fax || "",
        merged.tennv || "",
        merged.hotline || "",
        merged.tennv1 || "",
        merged.hotline1 || "",
        merged.tennv2 || "",
        merged.hotline2 || "",
        merged.toado || "",
        merged.facebook || "",
        merged.youtube || "",
        merged.zalo || "",
        merged.skype || "",
        merged.twitter || "",
        merged.zing || "",
        merged.google || "",
        merged.tip || "",
        merged.linktip || "",
        merged.analytics || "",
        merged.dangky || "",
        merged.tietkiem || "",
        merged.hailong || "",
      ]
    );

    return mapSettingRow(result.rows[0]);
  }
}

module.exports = new SettingModel();
