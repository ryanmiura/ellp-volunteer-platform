package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"ellp-volunter-platform/backend/internal/config"
	"ellp-volunter-platform/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	client := config.ConnectDB()
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatal(err)
		}
	}()

	db := client.Database("ellp_db")

	fmt.Println("🧹 Clearing existing data...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	db.Collection("users").DeleteMany(ctx, bson.M{})
	db.Collection("volunteers").DeleteMany(ctx, bson.M{})
	db.Collection("workshops").DeleteMany(ctx, bson.M{})
	cancel()

	fmt.Println("👤 Seeding users...")
	users := seedUsers(db)
	fmt.Printf("✅ Created %d users\n", len(users))

	fmt.Println("📚 Seeding workshops...")
	workshops := seedWorkshops(db)
	fmt.Printf("✅ Created %d workshops\n", len(workshops))

	fmt.Println("🤝 Seeding volunteers...")
	volunteers := seedVolunteers(db, workshops)
	fmt.Printf("✅ Created %d volunteers\n", len(volunteers))

	fmt.Println("\n==================================================")
	fmt.Println("🎉 SEED COMPLETED SUCCESSFULLY!")
	fmt.Println("==================================================")
	fmt.Println("\n📝 TEST CREDENTIALS:")
	fmt.Println("   Email: admin@ellp.com")
	fmt.Println("   Password: admin123456")
	fmt.Println("\n   Email: user@ellp.com")
	fmt.Println("   Password: user123456")
	fmt.Println("\n🚀 Use these credentials to login and test the application")
}

func seedUsers(db *mongo.Database) []models.User {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	users := []models.User{
		{
			ID:        primitive.NewObjectID(),
			Name:      "Admin User",
			Email:     "admin@ellp.com",
			Password:  hashPassword("admin123456"),
			Role:      "admin",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        primitive.NewObjectID(),
			Name:      "Regular User",
			Email:     "user@ellp.com",
			Password:  hashPassword("user123456"),
			Role:      "member",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        primitive.NewObjectID(),
			Name:      "Coordinator",
			Email:     "coordinator@ellp.com",
			Password:  hashPassword("coord123456"),
			Role:      "member",
			IsActive:  true,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	collection := db.Collection("users")
	for _, user := range users {
		if _, err := collection.InsertOne(ctx, user); err != nil {
			log.Printf("Error inserting user: %v", err)
		}
	}

	return users
}

func seedWorkshops(db *mongo.Database) []primitive.ObjectID {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	workshops := []map[string]interface{}{
		{
			"_id":         primitive.NewObjectID(),
			"title":       "Introduction to Web Development",
			"description": "Learn the basics of HTML, CSS, and JavaScript",
			"instructor":  "John Doe",
			"date":        time.Now().AddDate(0, 0, 7),
			"location":    "Room 101",
			"capacity":    30,
			"status":      "scheduled",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"title":       "Advanced Go Programming",
			"description": "Deep dive into Go concurrency and performance optimization",
			"instructor":  "Jane Smith",
			"date":        time.Now().AddDate(0, 0, 14),
			"location":    "Room 203",
			"capacity":    20,
			"status":      "scheduled",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"title":       "Database Design Patterns",
			"description": "Learn efficient database design and optimization techniques",
			"instructor":  "Mike Johnson",
			"date":        time.Now().AddDate(0, 0, 21),
			"location":    "Room 305",
			"capacity":    25,
			"status":      "scheduled",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"title":       "React & Frontend Frameworks",
			"description": "Master React, Vue, and modern frontend development",
			"instructor":  "Sarah Williams",
			"date":        time.Now().AddDate(0, 0, 28),
			"location":    "Lab 401",
			"capacity":    35,
			"status":      "scheduled",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
		{
			"_id":         primitive.NewObjectID(),
			"title":       "Cloud Architecture on AWS",
			"description": "Design and deploy scalable applications on Amazon Web Services",
			"instructor":  "David Brown",
			"date":        time.Now().AddDate(0, 1, 0),
			"location":    "Room 401",
			"capacity":    20,
			"status":      "scheduled",
			"created_at":  time.Now(),
			"updated_at":  time.Now(),
		},
	}

	collection := db.Collection("workshops")
	workshopIDs := make([]primitive.ObjectID, 0)

	for _, workshop := range workshops {
		result, err := collection.InsertOne(ctx, workshop)
		if err != nil {
			log.Printf("Error inserting workshop: %v", err)
			continue
		}
		oid := result.InsertedID.(primitive.ObjectID)
		workshopIDs = append(workshopIDs, oid)
	}

	return workshopIDs
}

func seedVolunteers(db *mongo.Database, workshopIDs []primitive.ObjectID) []models.Volunteer {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	workshopHexIDs := make([]string, len(workshopIDs))
	for i, id := range workshopIDs {
		workshopHexIDs[i] = id.Hex()
	}

	volunteers := []models.Volunteer{
		{
			ID:         primitive.NewObjectID(),
			Name:       "João Silva",
			Email:      "joao.silva@email.com",
			Phone:      "(11) 99999-9999",
			IsAcademic: true,
			Course:     "Engenharia de Computação",
			RA:         "123456",
			EntryDate:  time.Now().AddDate(0, -3, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[0], workshopHexIDs[1]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Maria Santos",
			Email:      "maria.santos@email.com",
			Phone:      "(11) 98888-8888",
			IsAcademic: true,
			Course:     "Psicologia",
			RA:         "234567",
			EntryDate:  time.Now().AddDate(0, -6, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[2], workshopHexIDs[3]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Pedro Oliveira",
			Email:      "pedro.oliveira@email.com",
			Phone:      "(11) 97777-7777",
			IsAcademic: false,
			Course:     "",
			RA:         "",
			EntryDate:  time.Now().AddDate(0, -2, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[0]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Ana Costa",
			Email:      "ana.costa@email.com",
			Phone:      "(11) 96666-6666",
			IsAcademic: true,
			Course:     "Medicina",
			RA:         "345678",
			EntryDate:  time.Now().AddDate(-1, 0, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[1], workshopHexIDs[4]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Carlos Rodrigues",
			Email:      "carlos.rodrigues@email.com",
			Phone:      "(11) 95555-5555",
			IsAcademic: true,
			Course:     "Direito",
			RA:         "456789",
			EntryDate:  time.Now().AddDate(0, -4, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[2], workshopHexIDs[3]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Fernanda Lima",
			Email:      "fernanda.lima@email.com",
			Phone:      "(11) 94444-4444",
			IsAcademic: false,
			Course:     "",
			RA:         "",
			EntryDate:  time.Now().AddDate(0, -1, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[0], workshopHexIDs[4]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Lucas Pereira",
			Email:      "lucas.pereira@email.com",
			Phone:      "(11) 93333-3333",
			IsAcademic: true,
			Course:     "Administração",
			RA:         "567890",
			EntryDate:  time.Now().AddDate(0, -5, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[1], workshopHexIDs[2]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Beatriz Gomes",
			Email:      "beatriz.gomes@email.com",
			Phone:      "(11) 92222-2222",
			IsAcademic: true,
			Course:     "Engenharia Civil",
			RA:         "678901",
			EntryDate:  time.Now().AddDate(0, -3, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[3], workshopHexIDs[4]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
		{
			ID:         primitive.NewObjectID(),
			Name:       "Rafael Costa",
			Email:      "rafael.costa@email.com",
			Phone:      "(11) 91111-1111",
			IsAcademic: false,
			Course:     "",
			RA:         "",
			EntryDate:  time.Now().AddDate(0, -7, 0),
			IsActive:   true,
			Workshops:  []string{workshopHexIDs[0], workshopHexIDs[2]},
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
	}

	collection := db.Collection("volunteers")
	for _, volunteer := range volunteers {
		if _, err := collection.InsertOne(ctx, volunteer); err != nil {
			log.Printf("Error inserting volunteer: %v", err)
		}
	}

	return volunteers
}

func hashPassword(password string) string {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	return string(hash)
}
