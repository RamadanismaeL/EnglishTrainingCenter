/*
*@auhtor: Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentCourseInfoMap : IEntityTypeConfiguration<StudentCourseInfoModel>
    {
        public void Configure(EntityTypeBuilder<StudentCourseInfoModel> builder)
        {
            builder.ToTable("tbStudentCourseInfo");

            builder.Property(s => s.Order)
                .HasColumnName("Order")
                .HasColumnType("bigint unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(s => s.Order);

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasIndex(s => s.Id)
                .IsUnique();

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

            builder.Property(s => s.QuizOne)
                .HasColumnName("QuizOne")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(s => s.QuizTwo)
                .HasColumnName("QuitTwo")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(s => s.Exam)
                .HasColumnName("Exam")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(s => s.FinalAverage)
                .HasColumnName("FinalAverage")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

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

            builder.Property(s => s.StudentId)
                .HasColumnName("StudentId")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.HasOne(s => s.StudentData)
                .WithMany(s => s.CourseInfo)
                .HasForeignKey(s => s.StudentId)
                .HasPrincipalKey(s => s.Id);

            builder.HasMany(sc => sc.MonthlyTuition)
                .WithOne(sm => sm.CourseInfoData)
                .HasPrincipalKey(sc => sc.Id)
                .HasForeignKey(sm => sm.CourseInfoId)
                .OnDelete(DeleteBehavior.Restrict);          
        }
    }
}