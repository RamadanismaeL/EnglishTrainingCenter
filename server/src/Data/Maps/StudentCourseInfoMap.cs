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

            builder.Property(s => s.StudentId)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)") 
                .IsRequired();
            builder.HasKey(s => s.StudentId);         

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

            builder.HasOne(s => s.StudentData)
                .WithOne(s => s.CourseInfo)
                .HasPrincipalKey<StudentDataModel>(s => s.Id)
                .HasForeignKey<StudentCourseInfoModel>(s => s.StudentId);
        }
    }
}