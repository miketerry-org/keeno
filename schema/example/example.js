// example.js:

const serverSchema = {
  port: { type: "integer", min: 1000, max: 65000 },
  db_url: { type: "string", min: 1, max: 255, capital: "lower" },
  log_collection_name: { type: "string", min: 1, max: 255, capital: "lower" },
  log_expiration_days: { type: "integer", min: 1, max: 365, optional: true },
  log_capped: { type: "boolean", optional: true },
  log_max_size: { type: "integer", min: 1, max: 1000, optional: true },
  log_max_docs: { type: "integer", min: 0, max: 1000000, optional: true },
  rate_limit_minutes: { type: "integer", min: 0, max: 60, default: 10 },
  rate_limit_requests: { type: "integer", min: 1, max: 1000, default: 200 },
};

const serverData = {
  port: 3000,
  db_url: "mongodb://localhost",
  log_collection_name: "logs",
  log_expiration_days: 90,
  log_capped: true,
  log_max_size: undefined,
  log_max_docs: 10000,
  rate_limit_minutes: 10,
  rate_limit_requests: 1000,
};

const tenantSchema = {
  id: { type: "integer", min: 1, max: 100000 },
  node: { type: "integer", min: 1, max: 100000 },
  mode: { type: "string", min: 1, max: 15 },
  domain: { type: "string", min: 1, max: 255 },
  db_url: { type: "string", min: 1, max: 255 },
  log_connection_name: { type: "string", min: 1, max: 255 },
  log_expiration_days: { type: "integer", min: 0, max: 365 },
  log_capped: { type: "boolean", default: false },
  log_max_size: { type: "integer", min: 1, max: 1000 },
  log_max_docs: { type: "integer", min: 0, max: 1000000 },
  site_title: { type: "string", min: 1, max: 255 },
  site_slogan: { type: "string", min: 1, max: 255 },
  site_owner: { type: "string", min: 1, max: 255 },
  site_author: { type: "string", min: 1, max: 255 },
  site_copyright: { type: "integer", min: 2025 },
  site_roles: { type: "strring", min: 1, max: 255 },
  amount: { type: "float", min: 1.0, max: 100.0 },
  birthdate: { type: "date", required: true },
  password: { type: "string", hide: true },
  role: {
    type: "enum",
    values: ["Guest", "member", "Admin"],
    default: "Guest",
    required: true,
  },
};

function getValue(name, data, schema) {
  let value = data[name];
  if (value) {
    return value;
  } else if (schema.default) {
    return schema.default;
  } else if (!schema.optional) {
    throw new Error(`"${name}" is required!`);
  } else {
    return undefined;
  }
}

function checkType(name, data, schema) {
  let value = getValue(name, data, schema);
  if (typeof value === schema.type) {
    return value;
  } else {
    throw new Error(`"${name}" must be a "${schema.type}`);
  }
}

function validateBoolean(errors, name, oldData, newData, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

function validateDate(errors, name, oldData, newData, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

function validateEnum(errors, name, oldData, newData, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

function validateFloat(errors, name, data, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

function validateInteger(errors, name, data, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

function validateString(errors, name, data, schema) {
  try {
    newData[name] = checkType(name, oldData, schema);
  } catch (err) {
    errors.push(err.message);
  }
  return null;
}

const _validators = {
  boolean: validateBoolean,
  date: validateDate,
  enum: validateEnum,
  float: validateFloat,
  integer: validateInteger,
  object: validateObject,
  string: validateString,
};

function findValidator(type) {
  const func = _validators[type];
  if (func) {
    return func;
  } else {
    throw new Error(`"${type}" type is not supported`);
  }
}

function validateProperty(errors, name, oldData, newData, schema) {
  // attempt ot find validation function based on schema.type
  let func = findValidator(schema.type);

  // use appropriate validator function
  if (func) {
    return func(errors, name, oldData, newData, schema);
  } else {
    throw new Error(`"${schema.type}" is not a supported data type`);
  }
}

function validateObject(errors, oldData, newData, schema) {
  // ensure the old and new data parameters are objects
  if (!oldData || typeof oldData !== "object") {
    throw new Error(`"oldData" parameter is required`);
  }
  if (!newData || typeof newData !== "object") {
    throw new Error(`"newData" parameter is required`);
  }

  // ensure the schema parameter is an object
  if (!schema || typeof schema !== "object") {
    throw new Error(`ValidateSchema: "data" parameter is required`);
  }

  Object.keys(schema).forEach(key => {
    validateProperty(errors, key, oldData, newData, schema[key]);
  });
}

function validate(data, schema) {
  let type = typeof data;
  let func = findValidator(type);
  if (func) {
    let errors = [];
    let newData = {};
    validateObject(errors, data, newData, schema);
    return { newData, errors };
  } else {
    throw new Error(`ype "${type}" is not supported`);
  }
}

let { data, errors } = validate(serverData, serverSchema);

console.log("errors", errors);
