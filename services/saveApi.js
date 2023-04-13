const ApiModel = require("../models/SaveApi");
const util = require("util");

const typeMap = {
  string: String,
  number: Number,
  boolean: Boolean,
  string: String,
  integer: Number,
};

function generateObject(obj) {
  let tmp = {};
  if (obj.isArray && obj.type == "object") {
    tmp[obj.name] = [];
    let tmpObj = {};
    for (const item of obj.children) {
      let current = generateObject(item);
      tmpObj[item.name] = current[item.name];
    }
    tmp[obj.name].push(tmpObj);
  } else if (!obj.isArray && obj.type == "object") {
    let tmp1 = {};
    for (const item of obj.children) {
      let current = generateObject(item);
      tmp1[item.name] = current[item.name];
    }
    tmp[obj.name] = tmp1;
  } else if (obj.isArray && obj.type != "object") {
    tmp[obj.name] = [{ type: typeMap[obj.type] }];
  } else {
    tmp[obj.name] = {
      type: typeMap[obj.type],
    };
    if (obj.enumValues && obj.enumValues.length > 0) {
      tmp[obj.name].enum = obj.enumValues;
    }

    if (obj.required) {
      tmp[obj.name].required = obj.required;
    }
  }
  return tmp;
}

module.exports = class UserApiService {
  static async createUserApi(data) {
    try {
      // creating new model object for validation
      const payload = {
        userId: data.userId,
        name: data.name,
        data: data.data,
        api: data.api,
      };
      const PayloadSchema = new ApiModel.PayloadValidation(payload);
      //   handling validation issues
      let pVError = PayloadSchema.validateSync();
      if (pVError) {
        console.log("ERROR IN PAYLOAD SHCEMA");
        // payload["validationError"] = pVError;
        // payload["createdAt"] = new Date();
        // saving the payload validation result
        // const r1= await new ApiModel.PayloadValidation(payload).save();
        return { status: false, code: 400, error: pVError["errors"] };
      }
      
      // generating full schema from raw payload
      const fullSchema = generateObject(data.data.data);

      // transforming the schema
      const userApiData = {
        userId: data.userId,
        name: data.name,
        api: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userApiData["api"][data.api] = {
        name: data.api,
        rawSchema: data.data,
        resources: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      for (let key in fullSchema[data.api]) {
        userApiData["api"][data.api]["resources"][key] = {
          schema: fullSchema[data.api][key][0],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      //   console.log(util.inspect(dbSchema, false, null, true /* enable colors */))
      console.log(userApiData);
      const uApi = new ApiModel.Users(userApiData);
      let uApiVError = uApi.validateSync();
      if (uApiVError) {
        return { status: false, code: 400, error: pVError["errors"] };
      } else {
      }

      const response = await uApi.save();
      return {
        status: true,
        code: 200,
        dbResponse: response,
      };
    } catch (error) {
      console.log(error);
      return { status: false, code: 500, message: "CreateUserAPi has failed" };
    }
  }
};
