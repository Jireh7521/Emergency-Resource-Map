# Emergency Resource Map

A location-based emergency resource discovery platform that helps users quickly find essential emergency services such as hospitals, police stations, fire stations, shelters, emergency offices, and IDP camps.

The platform provides an interactive map, search tools, category filters, and useful contact information so users can identify important emergency resources around a selected location.

---

## Overview

Emergency Resource Map is a full-stack web application designed to make emergency-service information easier to find and access.

During an emergency, people may not know where the nearest hospital, police station, fire station, shelter, or other important facility is located. Searching across different websites or asking people for directions can waste valuable time.

Emergency Resource Map brings this information together in one platform.

Users can search for resources, browse them on an interactive map, filter by category, view contact details, and identify nearby emergency services.

The project uses Python for its backend API and a modern web frontend for the user interface.

---

## Vision

To make reliable emergency-resource information easy to find, understand, and access through a simple location-based digital platform.

The long-term goal is to help people make faster and better-informed decisions when looking for emergency services.

---

## Project Objectives

The project aims to:

- Provide a centralized directory of emergency resources.
- Display emergency resources on an interactive map.
- Allow users to search for resources quickly.
- Allow users to filter resources by category.
- Provide useful information such as addresses and phone numbers.
- Help users identify resources close to their location.
- Maintain accurate and structured emergency-resource information.
- Provide administrators with tools for managing resource information.

---

## Core Workflow

1. A user opens the Emergency Resource Map.
2. The application loads available emergency resources.
3. The user searches for a resource or browses the map.
4. The user can filter resources by category.
5. Matching resources are displayed on the map and in the resource list.
6. The user selects a resource.
7. The application displays information about the selected resource.
8. The user can view its location, address, category, and available contact information.
9. If location permission is enabled, the system can help identify nearby resources.

---

## Emergency Resource Categories

The platform can support resources such as:

- Hospitals
- Clinics
- Police Stations
- Fire Stations
- Safe Shelters
- Emergency Management Offices
- Ambulance Services
- IDP Camps
- Rescue Centres
- Other verified emergency facilities

---

## Key Features

### Interactive Emergency Map

Emergency resources are displayed as markers on an interactive map.

Different resource categories can use different map markers or icons.

---

### Resource Search

Users can search for emergency resources using information such as:

- Resource name
- Location
- Address

Example:

```text
Search: General Hospital
```

---

### Category Filtering

Users can filter the map to display specific types of emergency resources.

Example:

```text
All
Hospitals
Police
Fire Service
Shelters
Emergency Offices
IDP Camps
```

---

### Resource Information

Selecting a resource can display:

```text
Resource Name
Category
Description
Address
Phone Number
Latitude
Longitude
```

Additional information may be added as the project develops.

---

### Nearby Resource Discovery

With the user's permission, the application can use their approximate device location to identify emergency resources near them.

Possible information includes:

- Distance from the user
- Nearest hospital
- Nearest police station
- Nearest fire station
- Other nearby emergency facilities

---

### Resource Management

Authorized administrators can manage emergency-resource information.

Administrators can:

- Add resources
- Edit resources
- Remove outdated resources
- Update contact information
- Update locations
- Verify resource information

---

### Responsive Design

The platform will be designed to work on:

- Mobile phones
- Tablets
- Laptops
- Desktop computers

Mobile usability is especially important because many users may access the platform through their phones.

---

## Backend API

The backend will provide REST API endpoints that allow the frontend to communicate with the database.

Example endpoints:

```text
GET    /api/resources

GET    /api/resources/{id}

POST   /api/resources

PUT    /api/resources/{id}

DELETE /api/resources/{id}
```

Search and filtering may use endpoints such as:

```text
GET /api/resources?search=hospital

GET /api/resources?category=police
```

Nearby-resource functionality may later use an endpoint such as:

```text
GET /api/resources/nearby
```

---

## Example Resource Data

```json
{
  "id": 1,
  "name": "General Hospital",
  "category": "hospital",
  "address": "Example Location",
  "phone": "08000000000",
  "latitude": 7.1906,
  "longitude": 8.1320
}
```

---

## Technology Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite
- React Leaflet
- Leaflet
- OpenStreetMap

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database

- PostgreSQL

### Testing

- Pytest
- FastAPI TestClient
- Frontend component testing

### Development

- Git
- GitHub
- GitHub Issues
- Feature Branches
- Pull Requests
- Code Reviews

### Deployment

Possible deployment services may include:

- Vercel or Netlify for the frontend
- Render, Railway, or another Python-compatible hosting service for the backend
- Managed PostgreSQL for the production database

The final deployment platform can be selected during the deployment stage of development.

---

## System Architecture

```text
                    User
                      |
                      v
               React Frontend
                      |
                      |
                   REST API
                      |
                      v
               FastAPI Backend
                      |
                  SQLAlchemy
                      |
                      v
                PostgreSQL
```

For map information:

```text
React Frontend
      |
      v
React Leaflet
      |
      v
OpenStreetMap
```

---

## Database Structure

A basic emergency resource record may contain:

```text
Resource
-------------------------
id
name
category
description
address
phone
latitude
longitude
verified
created_at
updated_at
```

Additional tables can later be introduced for:

```text
Users
Administrators
Resource Categories
Resource Verification
Reports
```

---

## Team Structure

The project is designed to be developed by a three-person team.

### Backend Developer

Responsible for:

- Python backend
- FastAPI
- Database connection
- SQLAlchemy models
- API endpoints
- Data validation
- Backend testing

### Frontend & Map Developer

Responsible for:

- React frontend
- User interface
- Search interface
- Category filters
- Resource cards
- Interactive map
- Map markers
- Responsive design

### Data, Integration & Deployment Developer

Responsible for:

- Emergency-resource data preparation
- Frontend and backend integration
- API testing
- Application testing
- Documentation
- Deployment configuration
- Production testing

Although each team member has a primary responsibility, all team members are expected to understand the overall project and participate in code reviews and project decisions.

---

## Development Workflow

Every team member should:

- Work on an assigned GitHub Issue.
- Create a separate feature branch.
- Make small and meaningful commits.
- Push changes to GitHub regularly.
- Open a Pull Request when a feature is ready.
- Request review from another team member.
- Fix identified issues before merging.
- Merge approved changes into the main branch.

Example branches:

```text
main

feature/resource-api

feature/database

feature/map

feature/search

feature/category-filter

feature/nearby-resources

feature/admin-dashboard
```

---

## Development Roadmap

### Phase 1 — Project Planning

- Define project requirements
- Define MVP
- Design system architecture
- Design database
- Create GitHub repository
- Create GitHub Issues

### Phase 2 — Backend Foundation

- Set up Python project
- Create virtual environment
- Install FastAPI
- Create FastAPI server
- Add health-check endpoint
- Organize backend structure

### Phase 3 — Database

- Install PostgreSQL
- Configure database connection
- Create SQLAlchemy models
- Create resource table
- Add database migrations

### Phase 4 — Resource API

- Create resource
- Retrieve resources
- Retrieve one resource
- Update resource
- Delete resource
- Add validation
- Add error handling

### Phase 5 — Frontend

- Create React application
- Set up TypeScript
- Configure Tailwind CSS
- Build application layout
- Create resource components

### Phase 6 — Interactive Map

- Add Leaflet
- Add OpenStreetMap
- Display resource markers
- Add marker information popup
- Add category marker types

### Phase 7 — Search and Filtering

- Search resources
- Filter by category
- Connect search to API
- Update map dynamically

### Phase 8 — Location Features

- Request browser location permission
- Detect user location
- Calculate nearby resources
- Display nearest resources

### Phase 9 — Administration

- Admin authentication
- Add resources
- Update resources
- Delete resources
- Verify resource information

### Phase 10 — Testing

- Backend API testing
- Database testing
- Search testing
- Filter testing
- Map testing
- Error handling testing
- Mobile responsiveness testing

### Phase 11 — Deployment

- Configure production environment
- Deploy PostgreSQL database
- Deploy FastAPI backend
- Deploy React frontend
- Configure CORS
- Configure environment variables
- Test production application

---

## Security Considerations

The platform should follow basic security practices including:

- Input validation
- Secure environment variables
- Password hashing for administrator accounts
- Role-based authorization
- Protected administrative endpoints
- HTTPS in production
- Database access restrictions
- API error handling
- Secure authentication
- Regular dependency updates

Sensitive information such as database passwords and secret keys must never be committed to GitHub.

---

## Data Accuracy

Because the application provides emergency-resource information, inaccurate information could reduce the usefulness of the platform.

The project should therefore distinguish between:

```text
Verified Resource

Unverified Resource

Needs Update
```

Administrative users should be able to review and update outdated information.

---

## AI Integration

Artificial Intelligence is not required for the initial version of Emergency Resource Map.

The first goal is to build a reliable application with:

- Accurate data
- Fast search
- Effective filtering
- Interactive mapping
- Nearby-resource discovery

AI should only be introduced later if there is a clear problem that it can solve better than normal application logic.

---

## Project Complexity

**Intermediate**

The project involves several important software-development concepts:

- Python backend development
- REST API development
- Database design
- Frontend development
- Mapping APIs
- Geographic coordinates
- Search and filtering
- Authentication
- Testing
- Git collaboration
- Deployment

---

## Expected Development Duration

Approximately **8 weeks** for the first functional version.

---

## Current Status

The Emergency Resource Map is currently in the planning and early development stage.

The initial focus is on developing the project's MVP, backend architecture, database structure, and core resource-management functionality.

---

## Contributors

### Team Lead

- Samuel Ochygole Jireh

### Team Members

- Team Member 2
- Team Member 3

The contributor section will be updated with the names and responsibilities of all project members.

---

## License

This project is being developed as a student software-development project.

License information will be added before public production release.
