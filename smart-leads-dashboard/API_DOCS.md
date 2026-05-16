# Smart Leads API Documentation

All API requests must be prefixed with the base URL. If running locally, the base URL is `http://localhost:5000/api`.

---

## 🔐 Auth Endpoints

### 1. Register User
Creates a new user account.

- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body** (JSON):
  ```json
  {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "password": "securepassword123",
      "role": "Sales User"  // Optional. Enum: ['Admin', 'Sales User']. Defaults to 'Sales User'
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
      "_id": "64bfc8...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "Sales User",
      "token": "eyJhbG..."
  }
  ```

### 2. Login User
Authenticates a user and returns a JWT token.

- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body** (JSON):
  ```json
  {
      "email": "jane@example.com",
      "password": "securepassword123"
  }
  ```
- **Success Response** (`200 OK`):
  Returns the user profile along with the `token`.

---

## 🎯 Leads Endpoints

> **Important**: ALL endpoints below require an Authorization header with a valid JWT token.
> **Header Example**: `Authorization: Bearer <your_jwt_token>`

### 3. Create Lead
Creates a new lead entry.

- **Endpoint**: `POST /leads`
- **Access**: Private
- **Request Body** (JSON):
  ```json
  {
      "name": "John Smith",
      "email": "john@smith.com",
      "status": "New",        // Optional. Enum: ['New', 'Contacted', 'Qualified', 'Lost']. Defaults to 'New'
      "source": "Website"     // Required. Enum: ['Website', 'Instagram', 'Referral']
  }
  ```
- **Success Response** (`201 Created`): Returns the newly created lead object.

### 4. Get All Leads (With Advanced Filtering)
Fetches a paginated list of leads based on query filters.

- **Endpoint**: `GET /leads`
- **Access**: Private
- **Query Parameters**:
  - `page` *(number)*: The page offset. (Default: `1`)
  - `search_term` *(string)*: Performs a fuzzy search on `name` or `email`.
  - `status` *(string)*: Exact match filter for Lead status.
  - `source` *(string)*: Exact match filter for Lead source.
  - `sort_by` *(string)*: Options are `latest` or `oldest`. (Default: `latest`)
- **Example Request**: `/leads?page=1&search_term=jane&status=Qualified&sort_by=latest`
- **Success Response** (`200 OK`):
  ```json
  {
      "leads": [ ...array of lead objects ... ],
      "page": 1,
      "pages": 5,        // Total number of pages available
      "total": 45        // Total document count matching the query
  }
  ```

### 5. Get Single Lead
Fetches a single lead by its unique ID.

- **Endpoint**: `GET /leads/:id`
- **Access**: Private
- **Success Response** (`200 OK`): Returns the lead object.

### 6. Update Lead
Updates an existing lead's fields. You only need to send the fields you wish to modify.

- **Endpoint**: `PUT /leads/:id`
- **Access**: Private
- **Request Body** (JSON):
  ```json
  {
      "status": "Contacted"
  }
  ```
- **Success Response** (`200 OK`): Returns the fully updated lead object.

### 7. Delete Lead
Removes a lead from the database entirely.

- **Endpoint**: `DELETE /leads/:id`
- **Access**: Private (Admin Only)
- **Error Response** (`403 Forbidden`): If the user making the request has the role `Sales User`.
- **Success Response** (`200 OK`):
  ```json
  {
      "message": "Lead removed"
  }
  ```

### 8. Export Leads to CSV
Downloads all leads from the system as a directly formatted CSV text.

- **Endpoint**: `GET /leads/export`
- **Access**: Private
- **Success Response** (`200 OK`): A downloadable blob file with the `text/csv` header.
