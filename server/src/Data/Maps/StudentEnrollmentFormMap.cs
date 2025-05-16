/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentEnrollmentFormMap : IEntityTypeConfiguration<StudentEnrollmentFormModel>
    {
        public void Configure(EntityTypeBuilder<StudentEnrollmentFormModel> builder)
        {
            builder.ToTable("tbStudentEnrollmentForm");

            builder.Property(s => s.StudentId)
                .HasColumnName("StudentId")
                .HasColumnType("varchar(50)") 
                .IsRequired();
            builder.HasKey(s => s.StudentId);  

            builder.HasOne(s => s.StudentData)
                .WithOne(s => s.EnrollmentForm)
                .HasPrincipalKey<StudentDataModel>(s => s.Id)
                .HasForeignKey<StudentEnrollmentFormModel>(s => s.StudentId);         

            
            // COURSE INFORMATION
            builder.Property(s => s.CourseName)
                .HasColumnName("CourseName")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.Package)
                .HasColumnName("Package")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.Level)
                .HasColumnName("Level")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.Modality)
                .HasColumnName("Modality")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.AcademicPeriod)
                .HasColumnName("AcademicPeriod")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.Schedule)
                .HasColumnName("Schedule")
                .HasColumnType("varchar(50)")                
                .IsRequired();
            
            builder.Property(s => s.Duration)
                .HasColumnName("Duration")
                .HasColumnType("varchar(50)")                
                .IsRequired();

            builder.Property(s => s.MonthlyFee)
                .HasColumnName("MonthlyFee")
                .HasColumnType("decimal(10,2)")                
                .IsRequired();

            builder.Property(s => s.Age)
                .HasColumnName("Age")
                .HasColumnType("int")                
                .IsRequired();

            
            // FEES AND PAYMENT
            builder.Property(s => s.CourseFee)
                .HasColumnName("CourseFee")
                .HasColumnType("decimal(10,2)")                
                .IsRequired();

            builder.Property(s => s.Installments)
                .HasColumnName("Installments")
                .HasColumnType("decimal(10,2)")                
                .IsRequired();

            
            // DATE
            builder.Property(s => s.Days)
                .HasColumnName("Days")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.Months)
                .HasColumnName("Months")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.Years)
                .HasColumnName("Years")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.Times)
                .HasColumnName("Times")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.TrainerName)
                .HasColumnName("TrainerName")
                .HasColumnType("varchar(50)") 
                .IsRequired();
        }
    }
}