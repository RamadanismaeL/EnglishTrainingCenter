/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentMonthlyTuitionMap : IEntityTypeConfiguration<StudentMonthlyTuitionModel>
    {
        public void Configure(EntityTypeBuilder<StudentMonthlyTuitionModel> builder)
        {
            builder.ToTable("tbStudentMonthlyTuition");

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

            builder.Property(s => s.Description)
                .HasColumnName("Description")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.ReferenceMonthDate)
                .HasColumnName("ReferenceMonthDate")
                .HasColumnType("datetime");

            builder.Property(s => s.DueDate)
                .HasColumnName("DueDate")
                .HasColumnType("datetime");

            builder.Property(s => s.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.TrainerName)
                .HasColumnName("TrainerName")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.DateRegister)
                .HasColumnName("DateRegister")
                .HasColumnType("datetime")
                .HasDefaultValueSql("current_timestamp")
                .IsRequired();

            builder.Property(s => s.DateUpdate)
                .HasColumnName("DateUpdate")
                .HasColumnType("datetime");


            builder.HasIndex(s => new { s.StudentId, s.ReferenceMonthDate })
                .IsUnique();

            builder.Property(s => s.StudentId)
                .HasColumnName("StudentId")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.HasOne(s => s.StudentData)
                .WithMany(sm => sm.MonthlyTuition)
                .HasPrincipalKey(s => s.Id)
                .HasForeignKey(s => s.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(s => s.CourseInfoId)
                .HasColumnName("CourseInfoId")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.HasOne(s => s.CourseInfoData)
                .WithMany(sm => sm.MonthlyTuition)
                .HasPrincipalKey(s => s.Id)
                .HasForeignKey(s => s.CourseInfoId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(s => s.PaymentId)
                .HasColumnName("PaymentId")
                .HasColumnType("varchar(50)");

            builder.HasOne(sp => sp.PaymentData)
                .WithOne(sm => sm.MonthlyTuitionData)
                .HasForeignKey<StudentMonthlyTuitionModel>(sm => sm.PaymentId)
                .HasPrincipalKey<StudentPaymentModel>(p => p.Id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}