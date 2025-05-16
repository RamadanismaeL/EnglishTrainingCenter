/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentPaymentMap : IEntityTypeConfiguration<StudentPaymentModel>
    {
        public void Configure(EntityTypeBuilder<StudentPaymentModel> builder)
        {
            builder.ToTable("tbStudentPayment");

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

            builder.Property(s => s.ReceivedFrom)
                .HasColumnName("ReceivedFrom")
                .HasColumnType("varchar(50)") 
                .IsRequired();

             builder.Property(s => s.PaymentType)
                .HasColumnName("PaymentType")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.DescriptionEnglish)
                .HasColumnName("DescriptionEnglish")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.DescriptionPortuguese)
                .HasColumnName("DescriptionPortuguese")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.Method)
                .HasColumnName("Method")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.AmountMT)
                .HasColumnName("AmountMT")
                .HasColumnType("decimal(10,2)") 
                .IsRequired();

            builder.Property(s => s.InWords)
                .HasColumnName("InWords")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)") 
                .IsRequired();

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

            builder.Property(t => t.DateRegister)
                .HasColumnName("DateRegister")
                .HasColumnType("datetime")
                .HasDefaultValueSql("current_timestamp")
                .IsRequired();


            builder.Property(s => s.StudentId)
                .HasColumnName("StudentId")
                .HasColumnType("varchar(50)") 
                .IsRequired();
            
            builder.HasOne(s => s.StudentData)
                .WithMany(p => p.Payments)
                .HasForeignKey(s => s.StudentId)
                .HasPrincipalKey(s => s.Id);


            builder.Property(s => s.TrainerId)
                .HasColumnName("TrainerId")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.Property(s => s.TrainerName)
                .HasColumnName("TrainerName")
                .HasColumnType("varchar(50)") 
                .IsRequired();

            builder.HasOne(s => s.Trainer)
                .WithMany(t => t.Payments)
                .HasForeignKey(s => s.TrainerId);
        }
    }
}