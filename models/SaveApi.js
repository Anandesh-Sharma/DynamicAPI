const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// these schema validations is defined for database
const ResourceSchema = Schema({
  mockApiData: { type: Object },
  schema: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ApiSchema = Schema({
  name: { type: String, required: true },
  openAPI: { type: Object },
  rawSchema: { type: Object, required: true },
  resources: { resourceId: ResourceSchema },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const dbSaveApiSchema = Schema({
  userId: { type: Schema.Types.UUID, required: true },
  name: { type: String, required: true },
  api: { apiId : ApiSchema },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SaveAPI = mongoose.model("SaveAPI", dbSaveApiSchema);
SaveAPI.schema
// const test = new SaveAPI({
//   userId: "f43c9fee-c5a4-464e-b0d9-64c4bd2f1435",
//   name: "Anandesh",
//   api: {
//     abc0: {
//       name: "API 1",
//       rawSchema: {},
//       resources: {
//         rs1: {
//           schema: {},
//         },
//         rs2: {
//           schema: {},
//         },
//       },
//     },
//     abc1: {
//       name: "API 1",
//       rawSchema: {},
//       resources: {
//         rs1: {
//           schema: {},
//         },
//         rs2: {
//           schema: {},
//         },
//       },
//     },
//   },
// });

// these schemas validations are defined for frontend
const FrSchema = new Schema({
    userId: { type: Schema.Types.UUID, required: true },
    name: { type: String, required: true },
    data: {type: Object, required: true},
    api: {type: String}
});

// let error = test.validateSync();
// console.log(error);
module.exports = {
  Users: mongoose.model("Users", dbSaveApiSchema),
  PayloadValidation: mongoose.model("PayloadValidation", FrSchema)
};
