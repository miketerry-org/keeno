try {
  console.log("register 1");
  // Validate the request body
  const { validated, errors } = validateRegister(req.body);
  console.log("register 2", errors);
  console.log("validated", validated);
  console.log("data", data);
  const hasErrors = errors.length > 0;
  console.log("hasErrors", hasErrors);
  if (errors.length > 0) {
    console.log("at least one error");
    const temp = response(400, undefined, errors);
    console.log("temp", temp);
    return temp;
  }
  console.log("validated", validated);

  // Get the authentication model
  const model = req.tenant.models("auth");
  console.log("model", model);

  // Attempt to create a new authentication document
  let auth = await model.create(validated);

  // Return success response with user ID and email
  const data = { id: auth.id, email: auth.email };
  return response(201, data, undefined);
} catch (err) {
  console.log("inside catch", errors.length);
  // Log the error
  req.tenant.log.error(err);

  // Handle duplicate email error
  if (err.code === 11000) {
    return response(409, undefined, ["Email already registered"]);
  }

  // Handle other errors
  return response(500, undefined, ["Registration failed"]);
}
