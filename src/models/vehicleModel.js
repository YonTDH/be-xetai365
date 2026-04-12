const catalogModel = require("./catalogModel");

class VehicleModel {
  list(filters) {
    return catalogModel.listProducts(filters);
  }

  findById(id) {
    return catalogModel.findProductByIdOrSlug(id);
  }

  create() {
    throw new Error("Vehicle create is not supported in migration skeleton");
  }

  update() {
    throw new Error("Vehicle update is not supported in migration skeleton");
  }

  delete() {
    throw new Error("Vehicle delete is not supported in migration skeleton");
  }
}

module.exports = new VehicleModel();
