/*
*@auhtor: Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentDataMap : IEntityTypeConfiguration<StudentDataModel>
    {
        public void Configure(EntityTypeBuilder<StudentDataModel> builder)
        {
            builder.ToTable("tbStudentData");

            builder.Property(s => s.Order)
                .HasColumnName("Order")
                .HasColumnType("bigint unsigned")
                .IsRequired()
                .ValueGeneratedOnAdd();
            builder.HasKey(s => s.Order);

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasIndex(s => s.Id)
                .IsUnique();


            // IDENTIFICATION DOCUMENT
            builder.Property(s => s.DocumentType)
                .HasColumnName("DocumentType")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.IdNumber)
                .HasColumnName("IdNumber")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.PlaceOfIssue)
                .HasColumnName("PlaceOfIssue")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.ExpirationDate)
                .HasColumnName("ExpirationDate")
                .HasColumnType("varchar(50)");


            // PERSONAL DATA
            builder.Property(s => s.FullName)
                .HasColumnName("FullName")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasIndex(s => s.FullName)
                .IsUnique();

            builder.Property(s => s.DateOfBirth)
                .HasColumnName("DateOfBirth")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.DateOfBirthCalc)
                .HasColumnName("DateOfBirthCalc")
                .HasColumnType("datetime")
                .IsRequired();

            builder.Property(s => s.Gender)
                .HasColumnName("Gender")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.MaritalStatus)
                .HasColumnName("MaritalStatus")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.Nationality)
                .HasColumnName("Nationality")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.PlaceOfBirth)
                .HasColumnName("PlaceOfBirth")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.ResidentialAddress)
                .HasColumnName("ResidentialAddress")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.FirstPhoneNumber)
                .HasColumnName("FirstPhoneNumber")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.SecondPhoneNumber)
                .HasColumnName("SecondPhoneNumber")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.EmailAddress)
                .HasColumnName("EmailAdress")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.AdditionalNotes)
                .HasColumnName("AdditionalNotes")
                .HasColumnType("varchar(120)");


            // EMERGENCY CONTACT / GUARDIAN
            builder.Property(s => s.GuardFullName)
                .HasColumnName("GuardFullName")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.GuardRelationship)
                .HasColumnName("GuardRelationship")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.GuardResidentialAddress)
                .HasColumnName("GuardResidentialAddress")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.GuardFirstPhoneNumber)
                .HasColumnName("GuardFirstPhoneNumber")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.GuardSecondPhoneNumber)
                .HasColumnName("GuardSecondPhoneNumber")
                .HasColumnType("varchar(50)");

            builder.Property(s => s.GuardEmailAddress)
                .HasColumnName("GuardEmailAddress")
                .HasColumnType("varchar(50)");



            builder.Property(s => s.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.TrainerName)
                .HasColumnName("TrainerName")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.DateUpdate)
                .HasColumnName("DateUpdate")
                .HasColumnType("datetime");



            builder.HasOne(s => s.EnrollmentForm)
                .WithOne(e => e.StudentData)
                .HasPrincipalKey<StudentDataModel>(s => s.Id)
                .HasForeignKey<StudentEnrollmentFormModel>(e => e.StudentId)
                .OnDelete(DeleteBehavior.Cascade);  // Se o StudentDataModel for deletado, o CourseInfo associado também será automaticamente removida. (Delete em cascata - Remove os dependentes)

            builder.HasOne(sd => sd.StudentCourseFee)
                .WithOne(sc => sc.StudentData)
                .HasPrincipalKey<StudentDataModel>(sd => sd.Id)
                .HasForeignKey<StudentCourseFeeModel>(sc => sc.StudentId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasMany(s => s.CourseInfo)
                .WithOne(c => c.StudentData)
                .HasPrincipalKey(s => s.Id)
                .HasForeignKey(c => c.StudentId)
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasMany(sd => sd.Payments)
                .WithOne(p => p.StudentData)
                .HasPrincipalKey(sd => sd.Id)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
                
            builder.HasMany(s => s.MonthlyTuition)
                .WithOne(p => p.StudentData)
                .HasPrincipalKey(s => s.Id)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}