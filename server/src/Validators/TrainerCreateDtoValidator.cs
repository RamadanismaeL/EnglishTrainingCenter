/*
*@author Ramadan Ismael
*/

using FluentValidation;
using server.src.DTOs;

namespace server.src.Validators
{
    public class TrainerCreateDtoValidator : AbstractValidator<TrainerCreateDto>
    {
        public TrainerCreateDtoValidator()
        {
            RuleFor(t => t.FullName)
                .Length(3, 100).WithMessage("The fullname must be between 3 and 100 characters.");

            RuleFor(t => t.Email)
                .EmailAddress().WithMessage("The provided email is not valid.");

            RuleFor(t => t.Position)
                .Length(3, 100).WithMessage("The position must be between 3 and 100 characters.");

            RuleFor(t => t.Roles)
                .NotEmpty().WithMessage("The role is required.");
        }     
    }
}