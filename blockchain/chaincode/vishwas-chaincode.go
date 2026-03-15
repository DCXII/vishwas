
package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing citizen records and crime records
type SmartContract struct {
	contractapi.Contract
}

// CitizenRecord describes basic details of a citizen's identity record
type CitizenRecord struct {
	ID          string `json:"id"`
	CitizenID   string `json:"citizenId"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	CreatedBy   string `json:"createdBy"`
	CreatedAt   string `json:"createdAt"`
	Status      string `json:"status"` // Active, Inactive, Flagged
}

// CrimeRecord describes details of a crime record associated with a citizen
type CrimeRecord struct {
	ID              string `json:"id"`
	CitizenID       string `json:"citizenId"`
	CrimeType       string `json:"crimeType"`
	Description     string `json:"description"`
	Severity        string `json:"severity"` // Low, Medium, High, Critical
	ReportedBy      string `json:"reportedBy"` // Authority/Police ID
	ReportedAt      string `json:"reportedAt"`
	Status          string `json:"status"` // Pending, Verified, Closed, Dismissed
	Evidence        string `json:"evidence"`
	Location        string `json:"location"`
	CaseNumber      string `json:"caseNumber"`
}

// Record describes basic details of what makes up a legal record (for backward compatibility)
type Record struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Owner       string `json:"owner"`
}

// InitLedger adds a base set of records to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	// Initialize with sample citizen record
	citizenRecords := []CitizenRecord{
		{
			ID: "citizen1", 
			CitizenID: "CIT001", 
			Name: "John Doe", 
			Email: "john@example.com", 
			Role: "Citizen", 
			CreatedBy: "Admin", 
			CreatedAt: time.Now().Format(time.RFC3339),
			Status: "Active",
		},
	}

	for _, record := range citizenRecords {
		recordJSON, err := json.Marshal(record)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState("CITIZEN_"+record.ID, recordJSON)
		if err != nil {
			return fmt.Errorf("failed to put citizen record to world state. %v", err)
		}
	}

	// Initialize with sample crime record
	crimeRecords := []CrimeRecord{
		{
			ID: "crime1",
			CitizenID: "CIT001",
			CrimeType: "Traffic Violation",
			Description: "Speeding violation on Highway 101",
			Severity: "Low",
			ReportedBy: "Officer Smith",
			ReportedAt: time.Now().Format(time.RFC3339),
			Status: "Verified",
			Evidence: "Speed camera footage",
			Location: "Highway 101, Mile 25",
			CaseNumber: "CASE2024001",
		},
	}

	for _, record := range crimeRecords {
		recordJSON, err := json.Marshal(record)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState("CRIME_"+record.ID, recordJSON)
		if err != nil {
			return fmt.Errorf("failed to put crime record to world state. %v", err)
		}
	}

	return nil
}

// CreateCitizenRecord creates a new citizen identity record
func (s *SmartContract) CreateCitizenRecord(ctx contractapi.TransactionContextInterface, id string, citizenId string, name string, email string, role string, createdBy string) error {
	exists, err := s.CitizenRecordExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the citizen record %s already exists", id)
	}

	citizenRecord := CitizenRecord{
		ID:        id,
		CitizenID: citizenId,
		Name:      name,
		Email:     email,
		Role:      role,
		CreatedBy: createdBy,
		CreatedAt: time.Now().Format(time.RFC3339),
		Status:    "Active",
	}
	
	recordJSON, err := json.Marshal(citizenRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("CITIZEN_"+id, recordJSON)
}

// CreateCrimeRecord creates a new crime record (only for Authority/Police roles)
func (s *SmartContract) CreateCrimeRecord(ctx contractapi.TransactionContextInterface, id string, citizenId string, crimeType string, description string, severity string, reportedBy string, evidence string, location string, caseNumber string) error {
	exists, err := s.CrimeRecordExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the crime record %s already exists", id)
	}

	crimeRecord := CrimeRecord{
		ID:         id,
		CitizenID:  citizenId,
		CrimeType:  crimeType,
		Description: description,
		Severity:   severity,
		ReportedBy: reportedBy,
		ReportedAt: time.Now().Format(time.RFC3339),
		Status:     "Pending",
		Evidence:   evidence,
		Location:   location,
		CaseNumber: caseNumber,
	}
	
	recordJSON, err := json.Marshal(crimeRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("CRIME_"+id, recordJSON)
}

// ReadCitizenRecord returns the citizen record stored in the world state with given id
func (s *SmartContract) ReadCitizenRecord(ctx contractapi.TransactionContextInterface, id string) (*CitizenRecord, error) {
	recordJSON, err := ctx.GetStub().GetState("CITIZEN_" + id)
	if err != nil {
		return nil, fmt.Errorf("failed to read citizen record from world state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("the citizen record %s does not exist", id)
	}

	var record CitizenRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

// ReadCrimeRecord returns the crime record stored in the world state with given id
func (s *SmartContract) ReadCrimeRecord(ctx contractapi.TransactionContextInterface, id string) (*CrimeRecord, error) {
	recordJSON, err := ctx.GetStub().GetState("CRIME_" + id)
	if err != nil {
		return nil, fmt.Errorf("failed to read crime record from world state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("the crime record %s does not exist", id)
	}

	var record CrimeRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

// GetCitizenCrimeRecords returns all crime records for a specific citizen
func (s *SmartContract) GetCitizenCrimeRecords(ctx contractapi.TransactionContextInterface, citizenId string) ([]*CrimeRecord, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("CRIME_", "CRIME_~")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var crimeRecords []*CrimeRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var crimeRecord CrimeRecord
		err = json.Unmarshal(queryResponse.Value, &crimeRecord)
		if err != nil {
			return nil, err
		}

		// Only include records for the specified citizen
		if crimeRecord.CitizenID == citizenId {
			crimeRecords = append(crimeRecords, &crimeRecord)
		}
	}

	return crimeRecords, nil
}

// GetAllCrimeRecords returns all crime records (for Authority/Police access)
func (s *SmartContract) GetAllCrimeRecords(ctx contractapi.TransactionContextInterface) ([]*CrimeRecord, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("CRIME_", "CRIME_~")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var crimeRecords []*CrimeRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var crimeRecord CrimeRecord
		err = json.Unmarshal(queryResponse.Value, &crimeRecord)
		if err != nil {
			return nil, err
		}
		crimeRecords = append(crimeRecords, &crimeRecord)
	}

	return crimeRecords, nil
}

// UpdateCrimeRecordStatus updates the status of a crime record
func (s *SmartContract) UpdateCrimeRecordStatus(ctx contractapi.TransactionContextInterface, id string, status string) error {
	crimeRecord, err := s.ReadCrimeRecord(ctx, id)
	if err != nil {
		return err
	}

	crimeRecord.Status = status
	recordJSON, err := json.Marshal(crimeRecord)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("CRIME_"+id, recordJSON)
}

// CitizenRecordExists returns true when citizen record with given ID exists in world state
func (s *SmartContract) CitizenRecordExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	recordJSON, err := ctx.GetStub().GetState("CITIZEN_" + id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return recordJSON != nil, nil
}

// CrimeRecordExists returns true when crime record with given ID exists in world state
func (s *SmartContract) CrimeRecordExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	recordJSON, err := ctx.GetStub().GetState("CRIME_" + id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return recordJSON != nil, nil
}

// CreateRecord issues a new record to the world state with given details.
func (s *SmartContract) CreateRecord(ctx contractapi.TransactionContextInterface, id string, description string, owner string) error {
	exists, err := s.RecordExists(ctx, id)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the record %s already exists", id)
	}

	record := Record{
		ID:          id,
		Description: description,
		Owner:       owner,
	}
	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(id, recordJSON)
}

// ReadRecord returns the record stored in the world state with given id.
func (s *SmartContract) ReadRecord(ctx contractapi.TransactionContextInterface, id string) (*Record, error) {
	recordJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("the record %s does not exist", id)
	}

	var record Record
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, err
	}

	return &record, nil
}

// RecordExists returns true when record with given ID exists in world state
func (s *SmartContract) RecordExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	recordJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return recordJSON != nil, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating vishwas chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting vishwas chaincode: %s", err.Error())
	}
}
